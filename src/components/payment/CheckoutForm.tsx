'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FygaroButton } from './FygaroButton';

// Definimos los props que este componente necesita recibir de su padre
interface CheckoutFormProps {
    amount: string;
    userId: string;       // Necesario para el webhook
    userEmail?: string;   
    purchaseData: any;    // El objeto con los tickets, evento, etc.
}

export function CheckoutForm({ amount = '0.00', userId, userEmail, purchaseData }: CheckoutFormProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Resumen de Pago</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
           <span className="font-medium">Total a Pagar</span>
           <span className="text-xl font-bold">C$ {amount}</span>
        </div>
        
        <FygaroButton 
            amount={parseFloat(amount)} 
            currency="NIO"
            description="Compra de Boletos - MiBoletoNi"
            onError={(msg) => alert(msg)}
            userId={userId}
            userEmail={userEmail}
            purchaseData={purchaseData}
        />
        <p className="text-xs text-center text-muted-foreground mt-4">
            Serás redirigido a la pasarela segura de Fygaro.
        </p>
      </CardContent>
    </Card>
  );
}
