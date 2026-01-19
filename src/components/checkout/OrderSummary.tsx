'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CountdownTimer } from "./CountdownTimer";

interface OrderSummaryProps {
  type: string | null;
  eventName?: string;
  venueName?: string;
  eventDate?: string;
  items: Array<{ name: string; price: number }>;
  totalPrice: number;
  currency: string;
  showTimer?: boolean;
  formattedTime?: string;
}

/**
 * Componente de resumen de orden
 * Muestra detalles del evento y desglose de precios
 */
export function OrderSummary({
  type,
  eventName,
  venueName,
  eventDate,
  items,
  totalPrice,
  currency,
  showTimer,
  formattedTime,
}: OrderSummaryProps) {
  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="font-headline">Resumen Final</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {type === 'numbered' && showTimer && formattedTime && (
          <CountdownTimer formattedTime={formattedTime} />
        )}
        <Separator />
        <div>
          <p className="font-semibold text-lg">{eventName}</p>
          <p className="text-sm text-muted-foreground">{venueName}</p>
          <p className="text-sm text-muted-foreground">{eventDate}</p>
        </div>
        <Separator />
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.name}</span>
              <span>
                {currency} {item.price.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex justify-between font-bold text-xl">
          <span>Total</span>
          <span>
            {currency} {totalPrice.toFixed(2)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
