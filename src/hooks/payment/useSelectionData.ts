import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { doc, collection, query, where, getDocs } from 'firebase/firestore';
import { useToast } from '../use-toast';
import type { PricingTier, Seat, WithId } from '@/lib/types';

export interface GeneralSelection {
    tierId: string;
    quantity: number;
    tierName: string;
    price: number;
    currency: string;
}

export interface NumberedSelection {
    seats: WithId<Seat>[];
}

export type SelectionData = GeneralSelection | NumberedSelection | null;

/**
 * Custom hook para cargar datos de selección (general o numbered)
 * Centraliza la lógica de fetch de tiers o seats
 */
export function useSelectionData(
    type: string | null,
    presentationId: string | null,
    tierId?: string | null,
    quantity?: number,
    seatIds?: string[]
) {
    const [selectionData, setSelectionData] = useState<SelectionData>(null);
    const [isLoading, setIsLoading] = useState(true);
    const firestore = useFirestore();
    const { toast } = useToast();

    useEffect(() => {
        if (!firestore || !type || !presentationId) {
            setIsLoading(false);
            return;
        }

        const fetchSelectionData = async () => {
            setIsLoading(true);
            try {
                if (type === 'general' && tierId && quantity && quantity > 0) {
                    const tierSnap = await getDocs(
                        query(
                            collection(firestore, 'presentations', presentationId, 'pricingtiers'),
                            where('__name__', '==', tierId)
                        )
                    );

                    if (!tierSnap.empty) {
                        const tierData = tierSnap.docs[0].data() as PricingTier;
                        setSelectionData({
                            tierId,
                            quantity,
                            tierName: tierData.name,
                            price: tierData.price,
                            currency: tierData.currency,
                        } as GeneralSelection);
                    }
                } else if (type === 'numbered' && seatIds && seatIds.length > 0) {
                    const seatSnaps = await Promise.all(
                        seatIds.map(id =>
                            getDocs(
                                query(
                                    collection(firestore, 'presentations', presentationId, 'seats'),
                                    where('__name__', '==', id)
                                )
                            )
                        )
                    );
                    const seats = seatSnaps.flatMap(snap =>
                        snap.docs.map(d => ({ id: d.id, ...d.data() } as WithId<Seat>))
                    );
                    setSelectionData({ seats } as NumberedSelection);
                }
            } catch (error) {
                console.error('Error fetching selection data:', error);
                toast({
                    variant: 'destructive',
                    title: 'Error',
                    description: 'No se pudo cargar la información de tu selección.',
                });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSelectionData();
    }, [firestore, type, presentationId, tierId, quantity, seatIds, toast]);

    return { selectionData, isLoading };
}
