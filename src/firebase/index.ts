'use client';



// Re-exportamos todo lo de firebaseClient para que esté disponible globalmente
export * from '@/lib/firebaseClient';


// Este archivo se convierte en un simple re-exportador de los módulos principales.
// La inicialización se ha movido a /lib/firebaseClient.ts
export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './auth/use-user';
export * from './errors';
export * from './error-emitter';
