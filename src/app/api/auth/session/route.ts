// app/api/auth/session/route.ts
export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';
import { cookies } from 'next/headers';
import type { User } from '@/lib/types';

const expiresIn = 60 * 60 * 24 * 5 * 1000; 

export async function POST(request: NextRequest) {
    console.log('🟢 POST /api/auth/session - Iniciando...');
    
    try {
        const body = await request.json();
        const { idToken } = body;

        if (!idToken) {
            console.warn('⚠️ ID Token missing');
            return NextResponse.json({ error: 'ID Token is required' }, { status: 400 });
        }

        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(idToken);
        } catch (verifyError: any) {
            console.error('❌ Token verification failed:', verifyError.message);
            return NextResponse.json({ error: 'Invalid token', details: verifyError.message }, { status: 401 });
        }

        const userDocRef = adminDb.collection('users').doc(decodedToken.uid);
        const userDoc = await userDocRef.get();
        let userRole = 'regular'; // Default role

        if (!userDoc.exists) {
            console.warn(`⚠️ Documento no encontrado para UID: ${decodedToken.uid}. Creando documento...`);
            const newUser: Omit<User, 'id'> = {
                name: decodedToken.name || 'Usuario Anónimo',
                email: decodedToken.email!,
                role: 'regular',
                promotionsAccepted: false,
                termsAccepted: true,
                createdAt: new Date() as any, 
            };
            await userDocRef.set(newUser);
            console.log(`✅ Documento creado para UID: ${decodedToken.uid}`);
        } else {
            const userData = userDoc.data();
            userRole = userData?.role || 'regular';
            console.log('✅ Documento de usuario encontrado, rol:', userRole);
        }

        const currentClaims = (await adminAuth.getUser(decodedToken.uid)).customClaims;
        if (currentClaims?.role !== userRole) {
            await adminAuth.setCustomUserClaims(decodedToken.uid, { role: userRole });
            console.log('✅ Custom claims actualizados');
        } else {
            console.log('ℹ️ Custom claims ya están correctos');
        }

        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        const cookieStore = await cookies();
        cookieStore.set('__session', sessionCookie, {
            maxAge: expiresIn / 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax'
        });

        return NextResponse.json({ 
            status: 'success',
            role: userRole 
        });

    } catch (error: any) {
        console.error('❌❌❌ ERROR CRÍTICO en POST /api/auth/session:', error);
        return NextResponse.json(
            { 
                error: 'Authentication failed', 
                details: error.message,
            }, 
            { status: 500 }
        );
    }
}

export async function DELETE() {
    console.log('🔴 DELETE /api/auth/session');
    try {
        const cookieStore = await cookies();
        cookieStore.set('__session', '', {
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax'
        });

        return NextResponse.json({ status: 'logged out' });
    } catch (error) {
        console.error('Error deleting session cookie:', error);
        return NextResponse.json(
            { error: 'Logout failed' }, 
            { status: 500 }
        );
    }
}
