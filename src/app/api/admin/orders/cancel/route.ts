import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { ticketService } from '@/lib/ticket-service';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        // 1. SEGURIDAD: Obtener la cookie de sesión
        const cookieStore = await cookies();
        const sessionCookie = cookieStore.get('session')?.value || '';
        
        if (!sessionCookie) {
            return NextResponse.json({ error: 'No hay sesión activa' }, { status: 401 });
        }

        // 2. VERIFICACIÓN: Decodificar la cookie y revisar el Rol en DB
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        
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
        // Esta función libera los asientos y cambia el status a 'refunded'
        await ticketService.cancelOrder(orderId);

        // 5. AUDITORÍA: (Opcional pero recomendado) Guardar quién lo hizo
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