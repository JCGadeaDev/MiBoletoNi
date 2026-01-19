'use client';

import React, { useState, useEffect, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { onIdTokenChanged } from 'firebase/auth';

// Importa los servicios ya inicializados
import { auth } from '@/lib/firebaseClient';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, (user) => {
        // En cuanto el SDK determina si hay usuario o no, consideramos que está inicializado.
        setIsInitialized(true);
    });

    // Cleanup
    return () => unsubscribe();
  }, []);

  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="text-center">
             <svg className="animate-spin h-10 w-10 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-lg font-medium text-foreground">Conectando con la plataforma...</p>
        </div>
      </div>
    );
  }

  // Una vez inicializado, envolvemos la app con el proveedor de contexto que contiene el estado del usuario.
  return (
    <FirebaseProvider>
      {children}
    </FirebaseProvider>
  );
}
