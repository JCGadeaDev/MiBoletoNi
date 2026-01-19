'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Phone } from "lucide-react";

interface BuyerInfoProps {
  displayName: string | null;
  email: string | null;
  phone?: string | null;
}

/**
 * Componente para mostrar información del comprador
 * Separado para reutilización y claridad
 */
export function BuyerInfo({ displayName, email, phone }: BuyerInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Revisa tus Datos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
          <Phone className="h-5 w-5 text-muted-foreground" />
          <div>
            <p className="font-semibold">{phone || 'Teléfono no registrado'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
