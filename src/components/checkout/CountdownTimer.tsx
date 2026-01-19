'use client';

/**
 * Componente de temporizador de cuenta regresiva
 * Muestra el tiempo restante de forma visual
 */
export function CountdownTimer({ 
  formattedTime 
}: { 
  formattedTime: string 
}) {
  return (
    <div className="text-center bg-destructive/10 border border-destructive/50 text-destructive p-3 rounded-lg">
      <p className="font-semibold">Tus boletos están reservados por:</p>
      <p className="text-2xl font-bold font-mono">{formattedTime}</p>
    </div>
  );
}
