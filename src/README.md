# MiBoletoNi - Frontend (Next.js)

## 🎨 Arquitectura Frontend Refactorizada

Este proyecto Next.js ha sido refactorizado siguiendo principios de **Clean Code** y **Component-Driven Development** para mejorar la mantenibilidad y reutilización.

### Estructura de Directorios

```
src/
├── app/                      # Next.js App Router
│   ├── (admin)/             # Rutas de administrador
│   ├── (auth)/              # Rutas de autenticación
│   ├── (checkout)/          # Flujo de checkout
│   │   ├── checkout/
│   │   ├── payment/         # ⭐ Refactorizado con hooks
│   │   └── confirmation/
│   └── (main)/              # Rutas públicas principales
├── components/
│   ├── checkout/            # ⭐ Componentes modulares de pago
│   │   ├── BuyerInfo.tsx
│   │   ├── PaymentForm.tsx
│   │   ├── OrderSummary.tsx
│   │   ├── CountdownTimer.tsx
│   │   └── index.ts
│   ├── ui/                  # Componentes base (shadcn/ui)
│   └── ...
├── hooks/
│   ├── payment/             # ⭐ Custom hooks de lógica de negocio
│   │   ├── usePayment.ts
│   │   ├── useReservationTimer.ts
│   │   ├── useSelectionData.ts
│   │   └── index.ts
│   └── use-toast.ts
├── lib/                     # Utilidades y configuraciones
│   ├── types.ts
│   ├── firebaseClient.ts
│   └── utils.ts
└── firebase/                # Context y providers de Firebase
```

---

## 🎯 Refactorización de Payment Page

### Antes
```tsx
// payment/page.tsx - 460 líneas 😱
- Lógica de pago inline
- Temporizador embebido
- Validación mezclada con UI
- Componentes no reutilizables
```

### Después ✨
```tsx
// payment/page.tsx - ~270 líneas 🎉
import { usePayment, useReservationTimer, useSelectionData } from '@/hooks/payment';
import { BuyerInfo, PaymentForm, OrderSummary } from '@/components/checkout';

export default function PaymentPage() {
  // Custom Hooks - Lógica de negocio separada
  const { processPayment, isProcessing } = usePayment();
  const { selectionData, isLoading } = useSelectionData(...);
  const { formattedTime, timedOut } = useReservationTimer(...);
  
  // Handler simplificado
  const handlePayment = async (formData) => {
    const result = await processPayment(formData, purchaseData);
    if (result.success) router.push('/confirmation');
  };
  
  // UI limpia y modular
  return (
    <BuyerInfo {...user} />
    <PaymentForm onSubmit={handlePayment} isSubmitting={isProcessing} />
    <OrderSummary {...summary} showTimer formattedTime={formattedTime} />
  );
}
```

**Beneficios:**
- ✅ 41% reducción de líneas
- ✅ Lógica testeable independientemente
- ✅ Componentes reutilizables
- ✅ Código más legible

---

## 🔧 Custom Hooks

### `usePayment`
Procesa pagos con Cybersource vía Cloud Functions.

```typescript
const { processPayment, isProcessing } = usePayment();

const result = await processPayment(
  { cardholderName, cardNumber, expiryDate, cvc },
  { presentationId, tickets, type, totalPrice, currency }
);

// result: { success, requires3DS?, info3DS?, message? }
```

### `useReservationTimer`
Maneja el temporizador de reserva de asientos.

```typescript
const { minutes, seconds, timedOut, formattedTime } = useReservationTimer(
  presentationId, seatIds, type, eventId, 600
);
```

### `useSelectionData`
Carga datos de tickets seleccionados (general o numbered).

```typescript
const { selectionData, isLoading } = useSelectionData(
  type, presentationId, tierId, quantity, seatIds
);
```

---

## 🧩 Componentes Modulares

### `<BuyerInfo />`
Muestra información del comprador.

```tsx
<BuyerInfo
  displayName={user.displayName}
  email={user.email}
  phone={user.phoneNumber}
/>
```

### `<PaymentForm />`
Formulario de pago con validación Zod.

```tsx
<PaymentForm
  onSubmit={handlePayment}
  isSubmitting={isProcessing}
  totalAmount="NIO 100.00"
/>
```

**Características:**
- Validación de tarjeta con Zod
- Detección automática de tipo de tarjeta (Visa/MC/Amex)
- Formato automático de fecha (MM/AA)
- Iconos visuales

### `<OrderSummary />`
Resumen de orden con desglose de precios.

```tsx
<OrderSummary
  type="numbered"
  eventName="Concierto XYZ"
  venueName="Teatro Nacional"
  items={[{ name: "Asiento A1", price: 50 }]}
  totalPrice={100}
  currency="NIO"
  showTimer={true}
  formattedTime="09:45"
/>
```

### `<CountdownTimer />`
Muestra cuenta regresiva visual.

```tsx
<CountdownTimer formattedTime="09:45" />
```

---

## 🚀 Ejecutar el Proyecto

### Desarrollo
```bash
npm run dev         # Puerto 9002 (configurado en package.json)
```

### Producción
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
npm run typecheck   # Verificar tipos TypeScript
```

---

## 📦 Dependencias Principales

- **Next.js 15**: Framework React con App Router
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Estilos utility-first
- **shadcn/ui**: Componentes UI base (Radix UI)
- **React Hook Form**: Manejo de formularios
- **Zod**: Validación de esquemas
- **Firebase SDK**: Auth y Firestore
- **Lucide React**: Iconos
- **React Icons**: Iconos adicionales (FA para tarjetas)

---

## 🎓 Mejores Prácticas Implementadas

1. **Separation of Concerns**
   - Hooks para lógica de negocio
   - Componentes para presentación
   - Páginas como orquestadores

2. **Component Composition**
   - Componentes pequeños y enfocados
   - Props tipadas con TypeScript
   - Reutilización máxima

3. **Custom Hooks**
   - Encapsulación de lógica compleja
   - Estado y efectos cohesivos
   - Fácil testing

4. **TypeScript Strict**
   - Tipado completo
   - Interfaces claras
   - Type safety

5. **Code Organization**
   - Barrel exports (`index.ts`)
   - Agrupación por features
   - Nombres descriptivos

---

## 🔜 Próximos Pasos Recomendados

1. **Testing**
   ```bash
   # Configurar Jest + React Testing Library
   npm install --save-dev @testing-library/react @testing-library/jest-dom
   ```

2. **Optimización de Performance**
   - Implementar React.memo en componentes puros
   - Lazy loading de componentes pesados
   - Optimización de imágenes con next/image

3. **Accesibilidad**
   - Agregar atributos ARIA
   - Keyboard navigation
   - Color contrast

4. **Error Boundaries**
   - Manejo de errores global
   - Fallback UI

---

## 📝 Convenciones de Código

- **Naming**: PascalCase para componentes, camelCase para funciones
- **File Organization**: Un componente por archivo
- **Exports**: Barrel exports para módulos
- **Comments**: JSDoc para funciones públicas
- **Styling**: Tailwind classes, evitar CSS inline

---

**Frontend MiBoletoNi - Optimizado y listo para escalar.** ⚡
