import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import { ticketService } from '@/lib/ticket-service';
import jwt from 'jsonwebtoken';
import { FieldValue } from 'firebase-admin/firestore';

interface FygaroJwtPayload {
    custom_reference?: string;
    reference?: string;
    status?: string;
    remote_id?: string;
    amount?: number;
    [key: string]: any;
}

const verifyAndDecodeFygaroJwt = (payload: any): FygaroJwtPayload | null => {
    if (!payload || !payload.jwt) {
        console.error('❌ [WEBHOOK] No se encontró el campo JWT');
        return null;
    }
    try {
        const secret = process.env.FYGARO_WEBHOOK_SECRET || '';
        return jwt.verify(payload.jwt, secret) as FygaroJwtPayload;
    } catch (e) {
        console.error('❌ [WEBHOOK] Error de firma JWT:', e);
        return null;
    }
};

export async function POST(request: Request) {
    try {
        const rawBody = await request.text();
        if (!rawBody) return NextResponse.json({ error: 'Body vacío' }, { status: 400 });

        let outerPayload: any;
        try {
            outerPayload = JSON.parse(rawBody);
        } catch (e) {
            return NextResponse.json({ error: 'JSON mal formado' }, { status: 400 });
        }

        const data = verifyAndDecodeFygaroJwt(outerPayload);
        if (!data) return NextResponse.json({ error: 'JWT inválido' }, { status: 401 });

        const reference = data.custom_reference || data.reference;
        const status = data.status?.toLowerCase();
        const transactionId = data.remote_id || data.id;

        if (!reference) return NextResponse.json({ error: 'Falta referencia' }, { status: 400 });

        const isPaid = ['paid', 'approved', 'success', 'completed'].includes(status || '');

        if (isPaid) {
            const intentRef = adminDb.collection('payment_intents').doc(reference);

            const shouldProcess = await adminDb.runTransaction(async (t) => {
                const doc = await t.get(intentRef);
                if (!doc.exists) return 'NOT_FOUND';
                
                const intentData = doc.data();
                if (intentData?.status === 'completed') return 'ALREADY_DONE';
                if (intentData?.status === 'processing') return 'PROCESSING';

                t.update(intentRef, { 
                    status: 'processing',
                    lastWebhookAt: FieldValue.serverTimestamp(),
                    fygaroTransactionId: transactionId
                });
                return { data: intentData };
            });

            // --- VALIDACIONES DE TIPO (Resuelve el error de 'undefined') ---
            if (shouldProcess === 'NOT_FOUND') {
                return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
            }
            if (shouldProcess === 'ALREADY_DONE' || shouldProcess === 'PROCESSING') {
                return NextResponse.json({ received: true, message: 'Ya procesado' });
            }

            // Aquí TypeScript ya sabe que shouldProcess es el objeto con 'data'
            const intent = (shouldProcess as { data: any }).data; 

            try {
                const result = await ticketService.finalizePurchase(
                    intent.userId,
                    intent.purchaseData.presentationId,
                    intent.purchaseData.tickets,
                    intent.purchaseData.type,
                    intent.purchaseData.totalPrice,
                    intent.purchaseData.currency,
                    intent.userPhone || ''
                );

                await intentRef.update({
                    status: 'completed',
                    orderId: result.orderId,
                    updatedAt: FieldValue.serverTimestamp()
                });

                return NextResponse.json({ success: true, orderId: result.orderId });

            } catch (serviceError: any) {
                await intentRef.update({
                    status: 'error_generating_tickets',
                    errorLog: serviceError.message,
                    updatedAt: FieldValue.serverTimestamp()
                });
                return NextResponse.json({ error: 'Fallo al generar tickets' }, { status: 500 });
            }
        }

        return NextResponse.json({ received: true, status: 'ignored' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}