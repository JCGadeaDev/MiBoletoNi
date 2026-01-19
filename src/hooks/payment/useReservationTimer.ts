import { useState, useCallback, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { useToast } from '../use-toast';
import { useRouter } from 'next/navigation';

/**
 * Custom hook para manejar el temporizador de reserva de asientos
 * Automatiza la liberación de asientos cuando expira el tiempo
 */
export function useReservationTimer(
    presentationId: string | null,
    seatIds: string[] | undefined,
    type: string | null,
    eventId?: string,
    duration: number = 600 // 10 minutos por defecto
) {
    const [timeLeft, setTimeLeft] = useState(duration);
    const [timedOut, setTimedOut] = useState(false);
    const firestore = useFirestore();
    const { toast } = useToast();
    const router = useRouter();

    const handleTimeout = useCallback(async () => {
        setTimedOut(true);

        // Liberar asientos si es tipo numbered
        if (firestore && type === 'numbered' && seatIds && seatIds.length > 0 && presentationId) {
            const batch = writeBatch(firestore);
            seatIds.forEach(seatId => {
                const seatRef = doc(firestore, 'presentations', presentationId, 'seats', seatId);
                batch.update(seatRef, {
                    status: 'available',
                    reservaExpiracion: null,
                    reservaSesionId: null,
                });
            });
            await batch.commit();
        }

        toast({
            variant: 'destructive',
            title: 'Tiempo Expirado',
            description: 'Tu reserva ha expirado. Por favor, selecciona tus boletos de nuevo.',
        });

        if (eventId) {
            router.push(`/events/${eventId}`);
        }
    }, [firestore, type, seatIds, presentationId, router, eventId, toast]);

    useEffect(() => {
        if (timeLeft <= 0) {
            handleTimeout();
            return;
        }

        const intervalId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft, handleTimeout]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    return {
        timeLeft,
        minutes,
        seconds,
        timedOut,
        formattedTime: `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`,
    };
}
