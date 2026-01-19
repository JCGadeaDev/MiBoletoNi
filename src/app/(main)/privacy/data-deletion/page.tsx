'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserX, Mail, ShieldAlert, Trash2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DataDeletionPage() {
  const supportEmail = "soporte@miboletoni.com";

  // Animaciones
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-16 md:py-24">
      <div className="container max-w-3xl mx-auto">
        
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="shadow-xl border-muted/60 overflow-hidden">
            {/* Header con gradiente suave */}
            <div className="bg-gradient-to-r from-red-50 to-background border-b p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <UserX className="h-8 w-8 text-red-600" />
                </div>
                <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                    Solicitud de Eliminación de Datos
                </h1>
                <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
                    Tu privacidad es tuya. Aquí te explicamos cómo ejercer tu derecho al olvido digital en nuestra plataforma.
                </p>
            </div>

            <CardContent className="p-8 md:p-10 space-y-10">
                {/* Introducción */}
                <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                    <p>
                        Si has utilizado nuestros servicios (vía Facebook Login, Google o registro directo), tienes derecho a solicitar la eliminación total de tu huella digital en nuestros servidores.
                    </p>
                </div>

                <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
                    
                    {/* Sección: Qué se borra */}
                    <motion.div variants={item} className="bg-background border rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-3 mb-4">
                            <Trash2 className="w-5 h-5 text-red-500" />
                            <h3 className="font-headline text-lg font-bold">¿Qué datos eliminaremos permanentemente?</h3>
                        </div>
                        <ul className="space-y-2 ml-2">
                            {["Tu perfil completo (nombre, email, foto).", "Historial de compras y boletos pasados.", "Logs de acceso y preferencias guardadas."].map((point, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                    <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Sección: Pasos (Diseño Visual) */}
                    <motion.div variants={item}>
                        <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-primary" />
                            Cómo solicitarlo en 3 pasos
                        </h3>
                        
                        <div className="grid gap-4 md:grid-cols-3">
                            {[
                                { title: "1. Redacta", desc: "Abre tu correo y escribe un nuevo mensaje.", icon: "✏️" },
                                { title: "2. Destinatario", desc: `Envía a: ${supportEmail}`, icon: "📧" },
                                { title: "3. Asunto", desc: 'Pon: "Solicitud de Eliminación de Datos"', icon: "🏷️" }
                            ].map((step, i) => (
                                <div key={i} className="bg-primary/5 p-4 rounded-lg border border-primary/10 text-center">
                                    <div className="text-2xl mb-2">{step.icon}</div>
                                    <div className="font-bold text-sm mb-1">{step.title}</div>
                                    <div className="text-xs text-muted-foreground break-words">{step.desc}</div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30 flex gap-3 items-start">
                            <ShieldAlert className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-yellow-700 dark:text-yellow-500">
                                <strong>Importante:</strong> Envía el correo desde la misma dirección que registraste en MiBoletoNi para verificar tu identidad.
                            </p>
                        </div>
                    </motion.div>

                    {/* Sección: Tiempos */}
                    <motion.div variants={item} className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
                        <CheckCircle2 className="w-6 h-6 text-green-600 mt-1" />
                        <div>
                            <h4 className="font-bold text-green-700 dark:text-green-500 text-sm">Proceso y Garantía</h4>
                            <p className="text-sm text-green-600/80 dark:text-green-400 mt-1">
                                Procesaremos tu solicitud en un máximo de <strong>14 días hábiles</strong>. Recibirás una confirmación final cuando tus datos hayan sido purgados de nuestros sistemas.
                            </p>
                        </div>
                    </motion.div>

                </motion.div>
            </CardContent>
            </Card>
        </motion.div>
      </div>
    </div>
  );
}