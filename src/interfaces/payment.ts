import type { Timestamp } from 'firebase-admin/firestore';

export type TicketPayload = {
    tierId?: string;
    tierName?: string;
    quantity?: number;
    seatId?: string;
    section?: string;
    row?: string;
    number?: string;
    price: number;
};

export type Order = {
    id: string;
    userId: string;
    presentationId: string;
    totalPrice: number;
    currency: 'NIO' | 'USD';
    purchaseDate: Timestamp;
    tickets: TicketPayload[];
};

export interface PurchaseData {
    presentationId: string;
    tickets: TicketPayload[];
    type: 'general' | 'numbered';
    totalPrice: number;
    currency: string;
}

export interface PaymentRequestData {
    nombre: string;
    numero: string;
    vencimiento: string;
    cvv: string;
    compra: PurchaseData;
}
