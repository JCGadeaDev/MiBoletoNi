import { NextResponse } from 'next/server';
import { fygaroService } from '@/lib/fygaro';
import { adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, currency, description, purchaseData, userId, userEmail, userPhone } = body;

        // Validación
        if (!amount || !purchaseData || !userId || !userPhone) {
            console.error('❌ Falta información:', { amount, userId, hasPhone: !!userPhone });
            return NextResponse.json({ error: 'Missing required fields (including phone)' }, { status: 400 });
        }

        // 2. Crear Intent en Firestore
        const intentRef = adminDb.collection('payment_intents').doc();
        const reference = intentRef.id; // <--- ESTE ES EL ID QUE NECESITAMOS EN EL FRONTEND

        await intentRef.set({
            userId,
            userEmail: userEmail || '',
            userPhone: userPhone,
            purchaseData,
            amount: parseFloat(amount),
            currency: currency || 'NIO',
            status: 'pending',
            createdAt: new Date(),
            description: description || 'Ticket Purchase'
        });

        // 3. URL de Retorno
        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const successUrl = `${origin}/confirmation?ref=${reference}`;

        // 4. Generar Token de Fygaro
        const token = fygaroService.generatePaymentToken({
            amount: parseFloat(amount),
            currency: currency || 'NIO',
            description: description || 'Purchase',
            reference: reference,
            redirectUrl: successUrl,
        });

        const redirectUrl = fygaroService.getPaymentUrl(token);
        
        console.log("✅ Intento de pago creado:", reference);

        // ------------------------------------------------------------
        // 👇 AQUÍ ESTÁ EL CAMBIO IMPORTANTE
        // Devolvemos 'customId' para que el botón lo guarde en localStorage
        // ------------------------------------------------------------
        return NextResponse.json({ 
            url: redirectUrl,
            customId: reference 
        });

    } catch (error: any) {
        console.error('❌ Error generando token:', error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}