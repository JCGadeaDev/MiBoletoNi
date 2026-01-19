export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('__session')?.value;

    if (!sessionCookie) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // 1. Verificar la session cookie
    // Agregamos un try/catch interno para ver el error exacto de Firebase
    let decodedClaims;
    try {
      decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    } catch (authError: any) {
      console.error('❌ Error de Firebase Auth:', authError.message);
      return NextResponse.json({ user: null, error: 'invalid_token' }, { status: 200 });
    }

    // 2. Obtener datos de Firestore
    const userDoc = await adminDb.collection('users').doc(decodedClaims.uid).get();
    
    if (!userDoc.exists) {
      console.warn(`⚠️ Usuario ${decodedClaims.uid} no encontrado en Firestore`);
      return NextResponse.json({ 
        user: { uid: decodedClaims.uid, email: decodedClaims.email, role: 'user' } 
      }, { status: 200 });
    }

    const userData = userDoc.data();

    return NextResponse.json({
      user: {
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        role: userData?.role || 'user',
        ...userData,
      }
    }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Error general en /api/auth/verify:', error.message);
    return NextResponse.json({ user: null }, { status: 200 });
  }
}