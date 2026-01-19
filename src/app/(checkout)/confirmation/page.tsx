"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, onSnapshot } from "firebase/firestore";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

// Importa tus HOOKS oficiales desde el provider
import { useFirebase } from "@/firebase/provider";

export default function ConfirmationPage() {
  const { user, isUserLoading, firestore } = useFirebase();

  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔎 ESTADO: Guardamos la referencia final aquí (ya sea de URL o LocalStorage)
  const [activeRef, setActiveRef] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "completed" | "failed">(
    "loading"
  );
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (isUserLoading || !firestore) return;

    // 🔎 1. BÚSQUEDA DE REFERENCIA
    //Prioridad:
    // 1. customReference (Lo que Fygaro devuelve en la URL como nuestro ID)
    // 2. custom_reference (Variante snake_case por si acaso)
    // 3. ref (Nuestro parámetro manual)
    // 4. reference (Último recurso, porque suele ser el ID interno de Fygaro)
    const urlRef =
      searchParams.get("customReference") ||
      searchParams.get("custom_reference") ||
      searchParams.get("ref");
    const localRef = localStorage.getItem("pendingOrderRef");

    const finalReference = urlRef || localRef;
    setActiveRef(finalReference);

    // 🔎 2. REDIRECCIÓN AUTH
    // Si no hay usuario, lo mandamos a loguear, pero mantenemos la referencia
    if (!user) {
      const redirectRef = finalReference ? `?ref=${finalReference}` : "";
      router.replace(`/auth?redirect=/confirmation${redirectRef}`);
      return;
    }

    // 🔎 3. SI NO HAY REFERENCIA EN NINGÚN LADO -> ERROR
    if (!finalReference) {
      setStatus("failed");
      return;
    }

    console.log(`🔎 Escuchando cambios en la orden: ${finalReference}`);

    // 🔎 4. ESCUCHA EN TIEMPO REAL
    const unsub = onSnapshot(
      doc(firestore, "payment_intents", finalReference),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          if (data.status === "completed") {
            setStatus("completed");
            setOrderId(data.orderId);
            // 🔎 LIMPIEZA: Ya terminamos, borramos el backup
            localStorage.removeItem("pendingOrderRef");
          } else if (data.status === "failed") {
            setStatus("failed");
          }
          // Si es 'processing' o 'pending', no hacemos nada (seguimos en loading)
        } else {
          // El documento no existe aun (webhook lento), seguimos esperando...
          console.log("Esperando creación del documento...");
        }
      },
      (error) => {
        console.error("Error escuchando payment_intent:", error);
        // Opcional: setStatus('failed') si quieres ser estricto con errores de red
      }
    );

    return () => unsub();
  }, [user, isUserLoading, searchParams, router, firestore]);

  // --- RENDERIZADO DE ESTADOS ---

  // 🔎 LÓGICA DE CARGA: Si está cargando usuario O si el status es loading
  if (isUserLoading || status === "loading") {
    return (
      <div className="flex flex-col h-screen items-center justify-center gap-4 bg-background font-sans">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <h2 className="text-xl font-bold">Verificando tu pago...</h2>
        <p className="text-lg font-medium animate-pulse text-muted-foreground">
          Confirmando tu transacción con el banco...
        </p>
        {/* Mostramos la referencia para depuración si existe */}
        {activeRef && <p className="text-xs text-gray-400">Ref: {activeRef}</p>}
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="container py-20 text-center max-w-lg font-sans">
        <XCircle className="h-20 w-20 text-destructive mx-auto mb-4" />
        <h1 className="text-3xl font-bold font-headline">
          No pudimos verificar el pago
        </h1>
        <p className="text-muted-foreground mt-2">
          Si el banco realizó el cargo, tu orden se procesará en breve.
          <br />
          Referencia:{" "}
          <span className="font-mono text-xs font-bold bg-muted p-1">
            {activeRef || "NO ENCONTRADA"}
          </span>
        </p>
        <div className="mt-8 flex flex-col gap-2">
          <Button onClick={() => window.location.reload()}>
            Intentar verificar nuevamente
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/">Volver a la cartelera</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10 font-sans">
      <div className="text-center mb-10">
        <h1 className="font-headline text-3xl font-bold">¡Pago Confirmado!</h1>
        <Progress value={100} className="w-full max-w-md mx-auto mt-4 h-2" />
        <div className="flex justify-between text-[10px] uppercase tracking-widest max-w-md mx-auto mt-2 font-bold text-muted-foreground">
          <span>Selección</span>
          <span>Pago</span>
          <span className="text-primary">Confirmación</span>
        </div>
      </div>

      <Card className="max-w-2xl mx-auto shadow-2xl border-none ring-1 ring-border overflow-hidden rounded-[2rem]">
        <div className="h-3 bg-gradient-to-r from-primary to-purple-600" />
        <CardContent className="p-8 md:p-12 text-center">
          <div className="bg-green-100 dark:bg-green-900/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>

          <h1 className="font-headline text-3xl md:text-4xl font-bold">
            ¡Gracias por tu compra, {user?.displayName?.split(" ")[0]}!
          </h1>
          <p className="mt-4 text-muted-foreground text-lg">
            Tu pago fue procesado con éxito. Prepárate para el evento.
          </p>

          {orderId && (
            <div className="mt-8 p-6 bg-primary/5 rounded-3xl border border-primary/20 inline-block">
              <p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] mb-2">
                Ticket de Orden
              </p>
              <p className="text-3xl font-mono font-black text-primary tracking-wider">
                {orderId.slice(-8).toUpperCase()}
              </p>
            </div>
          )}

          <div className="mt-10 p-6 bg-muted/40 rounded-2xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground mb-1">
              Enviamos tus entradas a:
            </p>
            <p className="font-bold text-foreground text-lg">{user?.email}</p>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              className="rounded-full px-10 font-bold shadow-xl hover:scale-105 transition-transform"
              asChild
            >
              <Link href="/dashboard/tickets">Ver mis Boletos</Link>
            </Button>
            <Button size="lg" variant="ghost" className="rounded-full" asChild>
              <Link href="/">Regresar al Inicio</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
