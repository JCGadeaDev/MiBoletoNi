import { NextResponse } from 'next/server';
import { getAdminDb, getAdminAuth } from '@/lib/firebase-admin';
import { Parser } from 'json2csv';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        console.log('📊 Generando reporte de ventas...');

        // 1. Verificación de Autenticación (Admin)
        // Intentamos obtener el usuario desde las cookies de sesión (si usas firebase auth cookies)
        // O verificamos si el cliente envía un token en el header Authorization.
        // Dado que la app parece usar Client SDK en el frontend, lo ideal es pasar el ID Token.

        // OPCIÓN ROBUSTA: Leer Authorization Header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized: Missing token' }, { status: 401 });
        }
        const idToken = authHeader.split('Bearer ')[1];

        const decodedToken = await getAdminAuth().verifyIdToken(idToken);
        if (decodedToken.role !== 'admin') {
            console.error(`⛔ Acceso denegado: Usuario ${decodedToken.uid} no es admin.`);
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const db = getAdminDb();
        const ordersRef = db.collection('orders');
        const snapshot = await ordersRef.orderBy('purchaseDate', 'desc').get();

        if (snapshot.empty) {
            console.log('ℹ️ No hay órdenes para el reporte.');
            return NextResponse.json({ csv: '' }); // Retornar vacío o manejar en frontend
        }

        const reportData = snapshot.docs.map(doc => {
            const order = doc.data();
            const firstTicket = order.tickets?.[0] || {};

            // Lógica de descripción de boletos (adaptada del original)
            const ticketDescription = firstTicket.tierName
                ? `${firstTicket.quantity} x ${firstTicket.tierName}`
                : `${order.tickets?.length || 0} x Asiento(s) (${firstTicket.section || 'N/A'})`;

            return {
                orderId: doc.id,
                userId: order.userId,
                presentationId: order.presentationId,
                totalPrice: order.totalPrice,
                currency: order.currency,
                purchaseDate: order.purchaseDate?.toDate ? order.purchaseDate.toDate().toISOString() : new Date(order.purchaseDate).toISOString(),
                ticketDetails: ticketDescription,
            };
        });

        const fields = [
            "orderId",
            "userId",
            "presentationId",
            "totalPrice",
            "currency",
            "purchaseDate",
            "ticketDetails",
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(reportData);

        console.log(`✅ Reporte generado por admin: ${decodedToken.uid}`);

        // Retornar CSV en base64 para mantener compatibilidad con el frontend existente que espera { csv: "base64..." }
        // O mejor aún, retornar JSON con el base64 o el texto directo.
        // El frontend espera: { data: { csv: "base64" } } si seguimos la estructura de httpsCallable response.

        const csvBase64 = Buffer.from(csv).toString('base64');
        return NextResponse.json({ csv: csvBase64 });

    } catch (error: any) {
        console.error('❌ Error generando reporte:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
