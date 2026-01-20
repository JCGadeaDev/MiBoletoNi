import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { ticketService } from '@/lib/ticket-service';

export async function POST(request: Request) {
    try {
        // 1. SEGURIDAD: Leer el Token del Header (Bearer Token)
        const authHeader = request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'No se proporcionó token de autorización' }, { status: 401 });
        }

        const idToken = authHeader.split('Bearer ')[1];

        // 2. VERIFICACIÓN: Decodificar el token con Firebase Admin
        const decodedClaims = await adminAuth.verifyIdToken(idToken);
        
        // Consultamos el usuario en Firestore para ver si es 'admin'
        const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
        const userData = userDoc.data();

        if (userData?.role !== 'admin') {
            return NextResponse.json({ error: 'Acceso denegado. Se requiere rol de Administrador.' }, { status: 403 });
        }

        // 3. DATOS: Obtener el ID de la orden
        const { orderId, reason } = await request.json();

        if (!orderId) {
            return NextResponse.json({ error: 'Falta el ID de la orden' }, { status: 400 });
        }

        console.log(`⚠️ [ADMIN] Cancelando orden ${orderId}. Autor: ${decodedClaims.email}. Razón: ${reason}`);

        // 4. ACCIÓN: Ejecutar la lógica del TicketService
        await ticketService.cancelOrder(orderId);

        // 5. AUDITORÍA
        await adminDb.collection('admin_logs').add({
            action: 'cancel_order',
            targetOrderId: orderId,
            performedBy: decodedClaims.uid,
            adminEmail: decodedClaims.email,
            reason: reason || 'Solicitud manual',
            timestamp: new Date()
        });

        return NextResponse.json({ success: true, message: 'Orden anulada y stock liberado correctamente' });

    } catch (error: any) {
        console.error('❌ Error anulando orden:', error);
        return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}