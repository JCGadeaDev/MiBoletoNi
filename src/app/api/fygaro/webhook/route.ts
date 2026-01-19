import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ticketService } from '@/lib/ticket-service';

// 1. Tipado básico para el payload de Fygaro (ajusta según documentación exacta)
interface FygaroPayload {
    custom_reference?: string;
    reference?: string;
    status?: string;
    transaction_status?: string;
    transaction_id?: string;
    id?: string;
    response_message?: string;
    jwt?: string; // Fygaro suele enviar un JWT para validar
    data?: {
        reference?: string;
        status?: string;
        id?: string;
    };
    [key: string]: any;
}

// TODO: Implementa esta función con tu clave secreta de Fygaro
const verifyFygaroSignature = (payload: any, headers: Headers): boolean => {
    // Aquí deberías verificar que la petición viene realmente de Fygaro.
    // Fygaro suele usar un JWT firmada o un header específico.
    // Si no verificas esto, es una vulnerabilidad de seguridad crítica.
    return true; // Cambiar a la lógica real
};

export async function POST(request: Request) {
    try {
        // --- 1. LEER BODY ---
        const rawBody = await request.text();
        console.log('🔔 [WEBHOOK] Raw Body recibido'); // Evita loguear todo el body si contiene datos sensibles

        if (!rawBody) {
            return NextResponse.json({ error: 'Empty body' }, { status: 400 });
        }

        // --- 2. PARSEAR JSON ---
        let payload: FygaroPayload;
        try {
            payload = JSON.parse(rawBody);
        } catch (e) {
            console.error('❌ [WEBHOOK] JSON Inválido');
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        // --- 3. SEGURIDAD ---
        if (!verifyFygaroSignature(payload, request.headers)) {
             console.error('⛔ [WEBHOOK] Firma inválida o intento de fraude.');
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // --- 4. NORMALIZACIÓN DE DATOS ---
        const reference = payload.custom_reference || payload.reference || payload?.data?.reference;
        const statusRaw = payload.status || payload.transaction_status || payload?.data?.status;
        const status = statusRaw?.toLowerCase();
        const transactionId = payload.transaction_id || payload.id || payload?.data?.id;

        if (!reference) {
            console.warn('⚠️ [WEBHOOK] Sin Reference ID. Ignorando.');
            return NextResponse.json({ error: 'No reference found' }, { status: 400 });
        }

        // --- 5. LÓGICA DE ESTADOS ---
        const isPaid = ['paid', 'approved', 'completed'].includes(status || '');
        const isFailed = ['declined', 'voided', 'failed'].includes(status || '');

        if (isPaid) {
            console.log(`🔍 [WEBHOOK] Procesando pago exitoso: ${reference}`);
            
            const intentRef = adminDb.collection('payment_intents').doc(reference);

            // USAMOS UNA TRANSACCIÓN O LOGICA DE BLOQUEO
            // Para evitar condiciones de carrera (doble entrada)
            const shouldProcess = await adminDb.runTransaction(async (t) => {
                const doc = await t.get(intentRef);
                
                if (!doc.exists) return 'NOT_FOUND';
                const data = doc.data();

                // Idempotencia fuerte: Si ya está completado O procesando, paramos.
                if (data?.status === 'completed') return 'ALREADY_DONE';
                if (data?.status === 'processing') return 'PROCESSING'; // Evita doble ejecución simultánea

                // Bloqueamos el documento marcándolo como 'processing'
                t.update(intentRef, { 
                    status: 'processing',
                    lastWebhookAt: new Date()
                });
                return { data: data }; // Devolvemos los datos para usarlos fuera
            });

            // Manejo de respuestas de la transacción
            if (shouldProcess === 'NOT_FOUND') {
                console.error(`❌ [WEBHOOK] Intent no encontrado en DB: ${reference}`);
                return NextResponse.json({ received: true, error: 'Intent not found' });
            }
            if (shouldProcess === 'ALREADY_DONE' || shouldProcess === 'PROCESSING') {
                console.log('ℹ️ [WEBHOOK] Orden ya procesada o en proceso.');
                return NextResponse.json({ received: true });
            }

            // Si llegamos aquí, tenemos luz verde y el documento está en estado 'processing'
            // @ts-ignore - TypeScript no sabe que shouldProcess es un objeto aquí
            const intent = shouldProcess.data; 

            try {
                console.log(`🎟️ [WEBHOOK] Generando tickets para: ${intent?.userId}`);
                
                const userPhone = intent?.userPhone || ''; 

                const result = await ticketService.finalizePurchase(
                    intent?.userId,
                    intent?.purchaseData.presentationId,
                    intent?.purchaseData.tickets,
                    intent?.purchaseData.type,
                    intent?.purchaseData.totalPrice,
                    intent?.purchaseData.currency,
                    userPhone
                );

                // Actualizar a Completado
                await intentRef.update({
                    status: 'completed',
                    orderId: result.orderId,
                    transactionId: transactionId,
                    fygaroPayload: payload,
                    updatedAt: new Date()
                });

                console.log(`✅ [WEBHOOK] ORDEN FINALIZADA: ${result.orderId}`);
                return NextResponse.json({ received: true, orderId: result.orderId });

            } catch (serviceError: any) {
                console.error('💀 [WEBHOOK] Error creando tickets, revirtiendo estado:', serviceError);
                
                // IMPORTANTE: Si falla la creación de tickets, revertimos el estado 'processing'
                // para permitir un reintento manual o automático, o lo marcamos como error.
                await intentRef.update({
                    status: 'error_generating_tickets',
                    errorLog: serviceError.message,
                    updatedAt: new Date()
                });

                return NextResponse.json({ error: 'Ticket creation failed' }, { status: 500 });
            }

        } else if (isFailed) {
            // Lógica de fallo
            await adminDb.collection('payment_intents').doc(reference).update({ 
                status: 'failed', 
                failureReason: payload.response_message || 'Declined',
                updatedAt: new Date()
            });
            console.log(`❌ [WEBHOOK] Pago rechazado: ${reference}`);
            return NextResponse.json({ received: true });
        }

        // Estado desconocido
        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('💀 [WEBHOOK] Error Fatal:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}