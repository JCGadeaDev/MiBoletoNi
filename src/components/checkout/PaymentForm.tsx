'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from 'zod';
import { CreditCard, Loader2 } from "lucide-react";
import { FaCcVisa, FaCcMastercard, FaCcAmex } from 'react-icons/fa';

// Esquema de validación
const paymentSchema = z.object({
  cardholderName: z.string().min(3, "El nombre del titular es requerido."),
  cardNumber: z
    .string()
    .min(15, "El número de tarjeta es inválido.")
    .max(19, "El número de tarjeta es inválido.")
    .regex(/^[0-9\s]+$/, "Solo se admiten números y espacios."),
  expiryDate: z
    .string()
    .min(5, "La fecha debe tener el formato MM/AA.")
    .max(5, "La fecha debe tener el formato MM/AA.")
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2})$/, "Formato inválido. Use MM/AA."),
  cvc: z
    .string()
    .min(3, "El CVC debe tener 3 o 4 dígitos.")
    .max(4, "El CVC debe tener 3 o 4 dígitos.")
    .regex(/^[0-9]{3,4}$/, "CVC inválido."),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSubmit: (data: PaymentFormValues) => void | Promise<void>;
  isSubmitting: boolean;
  totalAmount: string;
}

// Utilidad para detectar tipo de tarjeta
const getCardType = (number: string): string | null => {
  if (!number) return null;
  if (/^4/.test(number)) return 'visa';
  if (/^5[1-5]/.test(number)) return 'mastercard';
  if (/^3[47]/.test(number)) return 'amex';
  return null;
};

const CardIcon = ({ type }: { type: string | null }) => {
  const iconProps = { className: "w-8 h-8" };
  if (type === 'visa') return <FaCcVisa {...iconProps} className="text-blue-600" />;
  if (type === 'mastercard') return <FaCcMastercard {...iconProps} className="text-red-600" />;
  if (type === 'amex') return <FaCcAmex {...iconProps} className="text-blue-700" />;
  return <CreditCard {...iconProps} className="text-muted-foreground" />;
};

/**
 * Componente de formulario de pago
 * Maneja validación y entrada de datos de tarjeta
 */
export function PaymentForm({ onSubmit, isSubmitting, totalAmount }: PaymentFormProps) {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardholderName: '',
      cardNumber: '',
      expiryDate: '',
      cvc: '',
    },
  });

  const { watch } = form;
  const cardNumber = watch("cardNumber");
  const cardType = getCardType(cardNumber);

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    form.setValue('expiryDate', value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Información de Pago</CardTitle>
        <CardDescription>Todos los pagos son procesados de forma segura.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cardholderName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Titular</FormLabel>
                  <FormControl>
                    <Input placeholder="Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cardNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número de Tarjeta</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input placeholder="0000 0000 0000 0000" {...field} className="pr-12" />
                    </FormControl>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <CardIcon type={cardType} />
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiración</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/AA" {...field} onChange={handleExpiryDateChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cvc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CVC</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Procesando...
                </>
              ) : (
                `Pagar ${totalAmount}`
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
