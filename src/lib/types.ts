import { z } from 'zod';
import type { Timestamp } from 'firebase/firestore';

// Generic type to add Firestore ID to any type
export type WithId<T> = T & { id: string };

// Firestore collection types
export type Event = {
  name: string;
  category: 'Conciertos y Festivales' | 'Teatro' | 'Deportes' | 'Expo y Ferias' | string;
  description?: string;
  imageUrl?: string;
  // Agregamos artist opcional por si viene de la DB
  artist?: string;
};

export type Venue = {
  id: string;
  name: string;
  city: string;
  seatMapImageUrl?: string;
  type: 'general' | 'numbered';
};

export type Presentation = {
  eventId: string;
  venueId: string;
  eventDate: Timestamp;
  status: 'A la venta' | 'Pospuesto' | 'Agotado' | 'Cancelado';
};

export type PricingTier = {
  name: string;
  price: number;
  currency: 'NIO' | 'USD';
  capacity: number;
  sold: number;
};

export type Seat = {
  section: string;
  row: string;
  number: string;
  price: number;
  currency: 'NIO' | 'USD';
  status: 'available' | 'sold' | 'reserved';
  reservaExpiracion?: Timestamp | null;
  reservaSesionId?: string | null;
};

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'regular' | 'sales';
  promotionsAccepted: boolean;
  termsAccepted: boolean;
  createdAt?: Timestamp;
};

export type Order = {
  id: string;
  userId: string;
  presentationId: string;
  totalPrice: number;
  currency: 'NIO' | 'USD';
  purchaseDate: Timestamp;
  tickets: Array<any>;
  quantity: number;
  paymentStatus: string;
  eventId?: string;
}

// --- Types for Frontend Combination & Display ---
// ESTA ES LA INTERFAZ QUE USA EVENTCARD
export interface CombinedEvent {
  id: string; 
  name: string;
  category: string;
  description?: string;
  imageUrl?: string;

  // Data from the first available Presentation and its Venue
  city: string;
  venue: string;
  date: string; // Formatted date string (Texto: "12 Octubre")
  rawDate: Date; // Actual date object for sorting
  presentationId?: string; 

  // --- NUEVOS CAMPOS AGREGADOS PARA EL DISEÑO ---
  artist?: string;    // Para mostrar "con Artista X"
  minPrice?: number;  // Para mostrar "Desde $25"
}


export type BlogPost = {
  id: string;
  title: string;
  author: string;
  date: string;
  image: string;
  excerpt: string;
  category: 'Música' | 'Entrevistas' | 'Guías' | 'Detrás de Escena';
};


// User Management Flow Schemas and Types
export const DeleteUserInputSchema = z.object({
  userId: z.string().describe('The UID of the user to delete.'),
});
export type DeleteUserInput = z.infer<typeof DeleteUserInputSchema>;

export const DeleteUserOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type DeleteUserOutput = z.infer<typeof DeleteUserOutputSchema>;


export const SetUserRoleInputSchema = z.object({
  userId: z.string().describe('The UID of the user to modify.'),
  role: z.enum(['admin', 'regular']).describe('The role to assign to the user.'),
});
export type SetUserRoleInput = z.infer<typeof SetUserRoleInputSchema>;

export const SetUserRoleOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  debug: z.string().optional(),
});
export type SetUserRoleOutput = z.infer<typeof SetUserRoleOutputSchema>;