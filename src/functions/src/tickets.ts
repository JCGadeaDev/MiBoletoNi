
/**
 * Este archivo contiene las Cloud Functions relacionadas con la lógica de
 * boletos (tickets).
 */

import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Define la estructura de un boleto individual dentro de una orden.
 */
type TicketPayload = {
    tierId?: string;       // Para admisión general
    tierName?: string;     // Para admisión general
    quantity?: number;     // Para admisión general
    seatId?: string;       // Para asientos numerados
    section?: string;      // Para asientos numerados
    row?: string;          // Para asientos numerados
    number?: string;       // Para asientos numerados
    price: number;
};


/**
 * Procesa una compra de boletos, actualizando el inventario y creando la orden.
 * Esta es una función "Callable" que puede ser invocada directamente desde el cliente.
 * Utiliza una transacción de Firestore para garantizar la atomicidad de la operación.
 *
 * @param {onCall.Request} request - El objeto de la solicitud que contiene los datos de la compra.
 * @property {string} request.data.presentationId - ID de la presentación.
 * @property {TicketPayload[]} request.data.tickets - Array de boletos a comprar.
 * @property {string} request.data.type - 'general' o 'numbered'.
 * @property {number} request.data.totalPrice - El precio total calculado en el cliente.
 * @property {string} request.data.currency - La moneda de la transacción.
 * @returns {Promise<{success: boolean, orderId: string, message: string}>} - El resultado de la operación.
 */
export const onTicketPurchase = onCall(async (request) => {
    // 1. Autenticación y Validación de Datos
    if (!request.auth) {
        logger.error("Purchase attempt without authentication.");
        throw new HttpsError("unauthenticated", "Debes iniciar sesión para comprar.");
    }
    
    const { presentationId, tickets, type, totalPrice, currency } = request.data;
    const userId = request.auth.uid;

    if (!presentationId || !Array.isArray(tickets) || tickets.length === 0 || !type || !totalPrice || !currency) {
        throw new HttpsError("invalid-argument", "La solicitud de compra es incompleta o inválida.");
    }

    const firestore = admin.firestore();

    try {
        const purchaseResult = await firestore.runTransaction(async (transaction) => {
            const presentationRef = firestore.collection("presentations").doc(presentationId);
            const presentationDoc = await transaction.get(presentationRef);

            if (!presentationDoc.exists || presentationDoc.data()?.status !== 'A la venta') {
                throw new HttpsError("failed-precondition", "Esta presentación no está disponible para la venta.");
            }
            
            // Lógica para Admisión General
            if (type === 'general') {
                for (const ticket of tickets) {
                    const { tierId, quantity } = ticket;
                    const tierRef = firestore.doc(`presentations/${presentationId}/pricingtiers/${tierId}`);
                    const tierDoc = await transaction.get(tierRef);

                    if (!tierDoc.exists) throw new HttpsError("not-found", `La localidad ${ticket.tierName} no existe.`);
                    
                    const tierData = tierDoc.data()!;
                    const available = tierData.capacity - (tierData.sold || 0);
                    if (available < quantity) {
                        throw new HttpsError("resource-exhausted", `No hay suficientes boletos para la localidad ${tierData.name}.`);
                    }
                    
                    // Actualizar el contador de vendidos
                    transaction.update(tierRef, { sold: FieldValue.increment(quantity) });
                }
            } 
            // Lógica para Asientos Numerados
            else if (type === 'numbered') {
                for (const ticket of tickets) {
                    const { seatId } = ticket;
                    const seatRef = firestore.doc(`presentations/${presentationId}/seats/${seatId}`);
                    const seatDoc = await transaction.get(seatRef);
                    const seatData = seatDoc.data();

                    if (!seatDoc.exists) {
                         throw new HttpsError("not-found", `El asiento ${seatId} no fue encontrado.`);
                    }

                    // Verifica que el asiento esté reservado por el usuario actual
                    if (seatData?.status !== 'reserved' || seatData?.reservaSesionId !== userId) {
                        throw new HttpsError("failed-precondition", `El asiento ${ticket.row}${ticket.number} ya no está disponible o tu reserva expiró.`);
                    }
                    
                    // Marcar el asiento como vendido y limpiar datos de reserva
                    transaction.update(seatRef, { 
                        status: 'sold',
                        reservaExpiracion: null,
                        reservaSesionId: null,
                    });
                }
            } else {
                 throw new HttpsError("invalid-argument", "El tipo de venta no es válido.");
            }

            // Crear la orden en la subcolección del usuario
            const userOrderRef = firestore.collection("users").doc(userId).collection("orders").doc();
            const newOrder = {
                userId,
                presentationId,
                purchaseDate: FieldValue.serverTimestamp(),
                totalPrice,
                currency,
                tickets, // Almacena el detalle de los boletos comprados
            };
            transaction.set(userOrderRef, newOrder);

             // También crea la orden en la colección raíz 'orders' para los administradores
            const rootOrderRef = firestore.collection("orders").doc(userOrderRef.id);
            transaction.set(rootOrderRef, newOrder);


            return {
                success: true,
                orderId: userOrderRef.id,
                message: "¡Compra realizada con éxito!",
            };
        });

        logger.log(`Successful purchase by user ${userId} for presentation ${presentationId}. Order ID: ${purchaseResult.orderId}`);
        return purchaseResult;

    } catch (error) {
        logger.error(`Purchase transaction failed for user ${userId}:`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Ocurrió un error al procesar tu compra. Inténtalo de nuevo.");
    }
});
