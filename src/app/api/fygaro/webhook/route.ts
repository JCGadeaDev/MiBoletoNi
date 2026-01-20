import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ticketService } from '@/lib/ticket-service';
import jwt from 'jsonwebtoken';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        if (!rawBody) return NextResponse.json({ error: 'Body vacío' }, { status: 400 });

        const outerPayload = JSON.parse(rawBody);
        const secret = process.env.FYGARO_API_SECRET; 

        if (!secret) {
            console.error('❌ [WEBHOOK] Error: FYGARO_API_SECRET no configurada en Cloud Run');
            return NextResponse.json({ error: 'Secret missing' }, { status: 500 });
        }

        // 1. Decodificación y Verificación del JWT
        let data: any;
        try {
            data = jwt.verify(outerPayload.jwt, secret) as any;
        } catch (jwtError: any) {
            console.error('❌ [WEBHOOK] Error de firma JWT:', jwtError.message);
            return NextResponse.json({ error: 'Invalid JWT' }, { status: 401 });
        }

        // --- 🔍 DIAGNÓSTICO PROFUNDO (Revisa esto en Cloud Run Logs) ---
        console.log('--------------------------------------------------');
        console.log('📦 [FULL JWT DATA]:', JSON.stringify(data, null, 2));
        console.log('--------------------------------------------------');

        // 2. Mapeo Flexible de Campos (Fygaro puede variar los nombres)
        // Buscamos el ID de Firestore (jgCo00dUG...) en cualquier campo posible
        const reference = data.custom_reference || data.customReference || data.remote_id || data.order_number;
        
        // Buscamos el estado del pago
        const status = (data.status || data.transaction_status || data.response_message || 'unknown').toLowerCase();
        
        // El ID de transacción de Fygaro (O-EB75...)
        const fygaroReference = data.reference || data.id;

        console.log(`🔎 [WEBHOOK] Analizando - Ref: ${reference}, Status: ${status}, FygaroRef: ${fygaroReference}`);

        // 3. Lógica de Aprobación
        // Incluimos 'authorized' por si tienes captura manual o Fygaro lo envía así inicialmente
        const isPaid = ['paid', 'approved', 'success', 'completed', 'authorized'].includes(status);

        if (reference && isPaid) {
            console.log(`🚀 [WEBHOOK] Iniciando procesamiento de tickets para: ${reference}`);
            
            const intentRef = adminDb.collection('payment_intents').doc(reference);

            const result = await adminDb.runTransaction(async (transaction) => {
                const doc = await transaction.get(intentRef);
                
                if (!doc.exists) return 'NOT_FOUND';
                const intentData = doc.data();

                if (intentData?.status === 'completed') return 'ALREADY_DONE';

                // Bloqueamos el proceso marcándolo como 'processing'
                transaction.update(intentRef, { 
                    status: 'processing',
                    lastWebhookAt: FieldValue.serverTimestamp(),
                    fygaroId: fygaroReference
                });

                return { intentData };
            });

            if (result === 'NOT_FOUND') {
                console.error(`❌ [WEBHOOK] No se encontró el documento intent en Firestore: ${reference}`);
                return NextResponse.json({ error: 'Intent not found' }, { status: 404 });
            }

            if (result === 'ALREADY_DONE') {
                console.log('ℹ️ [WEBHOOK] Esta orden ya había sido completada anteriormente.');
                return NextResponse.json({ received: true, message: 'Already processed' });
            }

            // 4. Ejecutar el servicio de creación de boletos
            try {
                const intent = (result as any).intentData;
                const purchaseResult = await ticketService.finalizePurchase(
                    intent.userId,
                    intent.purchaseData.presentationId,
                    intent.purchaseData.tickets,
                    intent.purchaseData.type,
                    intent.purchaseData.totalPrice,
                    intent.purchaseData.currency,
                    intent.userPhone || ''
                );

                // 5. Finalizar la transacción marcando como 'completed'
                await intentRef.update({
                    status: 'completed',
                    orderId: purchaseResult.orderId,
                    updatedAt: FieldValue.serverTimestamp()
                });

                console.log(`✅ [WEBHOOK] ORDEN COMPLETADA EXITOSAMENTE: ${purchaseResult.orderId}`);
                return NextResponse.json({ success: true, orderId: purchaseResult.orderId });

            } catch (serviceError: any) {
                console.error('💀 [WEBHOOK] Error en TicketService:', serviceError.message);
                await intentRef.update({
                    status: 'error_in_service',
                    errorDetails: serviceError.message,
                    updatedAt: FieldValue.serverTimestamp()
                });
                return NextResponse.json({ error: 'Fallo al procesar boletos' }, { status: 500 });
            }
        }

        console.warn(`⚠️ [WEBHOOK] Pago no procesado por falta de ID o estado no exitoso. Status: ${status}`);
        return NextResponse.json({ received: true, status });

    } catch (error: any) {
        console.error('💀 [WEBHOOK] Error crítico:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}