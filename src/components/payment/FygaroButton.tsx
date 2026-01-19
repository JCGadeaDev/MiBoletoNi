"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FygaroButtonProps {
    amount: number;
    currency?: string;
    description: string;
    purchaseData: any;
    userId: string;
    userEmail?: string;
    userPhone?: string;
    onPaymentInitiated?: (url: string) => void;
    onError?: (error: string) => void;
}

export function FygaroButton({ 
    amount, 
    currency = 'USD', 
    description,
    purchaseData,
    userId,
    userEmail,
    userPhone, 
    onPaymentInitiated,
    onError 
}: FygaroButtonProps) {
    const [loading, setLoading] = useState(false);

    const handlePayment = async () => {
        // 1. Validación
        if (!userId || !purchaseData || !userPhone) {
            const errorMsg = !userPhone 
                ? "Falta el número de teléfono del usuario." 
                : "Faltan datos de la compra.";
            
            console.error("❌ Fygaro Validation Error:", errorMsg);
            if(onError) onError(errorMsg);
            return;
        }

        setLoading(true);

        // 2. ABRIR VENTANA (Placeholder)
        const newWindow = window.open('', '_blank');
        
        if (newWindow) {
            newWindow.document.write(`
                <html>
                    <head><title>Procesando...</title></head>
                    <body style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;background-color:#f4f4f5;margin:0;">
                        <div style="text-align:center; padding: 20px;">
                            <h2 style="color: #2563eb;">Conectando con la pasarela de pago...</h2>
                            <p style="color: #64748b;">Estamos preparando tu transacción segura con Fygaro.</p>
                            <p style="color: #94a3b8; font-size: 0.9em;">Por favor no cierres esta ventana.</p>
                        </div>
                    </body>
                </html>
            `);
        } else {
            if (onError) onError("El navegador bloqueó la ventana emergente. Por favor permite pop-ups.");
            setLoading(false);
            return;
        }

        try {
            // 3. Llamada al Backend
            const response = await fetch('/api/fygaro/generate-token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    currency,
                    description,
                    purchaseData,
                    userId,
                    userEmail,
                    userPhone 
                })
            });

            const data = await response.json();

            if (!response.ok || data.error) {
                newWindow.close();
                throw new Error(data.error || 'Error al inicializar el pago con Fygaro');
            }

            // ---------------------------------------------------------
            // 🛑 AQUÍ ESTÁ LA CLAVE DEL ÉXITO ("PLAN B")
            // Guardamos la referencia que nos devuelve el backend
            // Asegúrate que tu API devuelva 'customId' o el nombre que uses
            // ---------------------------------------------------------
            if (data.customId) {
                console.log("💾 Guardando referencia en LocalStorage:", data.customId);
                localStorage.setItem('pendingOrderRef', data.customId);
            } else {
                console.warn("⚠️ El backend no devolvió 'customId', el Plan B podría fallar.");
            }
            // ---------------------------------------------------------

            const targetUrl = data.url;
            
            if (!targetUrl) {
                newWindow.close();
                throw new Error("No se recibió la URL de pago desde el servidor.");
            }

            if (onPaymentInitiated) {
                onPaymentInitiated(targetUrl);
            }

            // 4. Redirigir
            newWindow.location.href = targetUrl;

        } catch (err: any) {
            console.error('🚀 Fygaro Error:', err);
            if (newWindow && !newWindow.closed) newWindow.close();
            if (onError) onError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button 
            onClick={handlePayment} 
            disabled={loading} 
            className="w-full bg-[#1e40af] hover:bg-[#1e3a8a] text-white font-bold py-6 shadow-lg transition-all"
        >
            {loading ? (
                <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Procesando...
                </>
            ) : (
                "Pagar con Fygaro"
            )}
        </Button>
    );
}