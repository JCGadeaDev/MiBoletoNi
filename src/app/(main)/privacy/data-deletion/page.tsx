'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { UserX, Mail, ShieldAlert, Trash2, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DataDeletionPage() {
    const supportEmail = "soporte@miboletoni.com";

    // Variantes para animaciones staggered
    const container = {
        hidden: { opacity: 0 },
        show: { 
            opacity: 1, 
            transition: { staggerChildren: 0.1 } 
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="w-full min-h-screen bg-muted/20 py-12 md:py-24 flex flex-col items-center">
            {/* Contenedor Maestro: max-w-3xl es ideal para lectura legal/instrucciones */}
            <div className="w-full max-w-3xl mx-auto px-4">
                
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card className="shadow-xl border-muted/60 overflow-hidden">
                        {/* Header con gradiente de advertencia suave */}
                        <div className="bg-gradient-to-r from-red-50 to-background dark:from-red-950/10 border-b p-8 text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <UserX className="h-8 w-8 text-red-600" />
                            </div>
                            <h1 className="font-headline text-3xl md:text-4xl font-bold text-foreground">
                                Eliminación de Datos
                            </h1>
                            <p className="text-muted-foreground mt-2 max-w-lg mx-auto text-sm md:text-base">
                                Tu privacidad es tuya. Aquí te explicamos cómo ejercer tu derecho al olvido digital en nuestra plataforma.
                            </p>
                        </div>

                        <CardContent className="p-6 md:p-10 space-y-10">
                            {/* Introducción */}
                            <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                <p>
                                    Si has utilizado nuestros servicios (vía Facebook Login, Google o registro directo), tienes derecho a solicitar la eliminación total de tu huella digital en nuestros servidores en cumplimiento con las normativas de protección de datos.
                                </p>
                            </div>

                            <motion.div 
                                variants={container} 
                                initial="hidden" 
                                animate="show" 
                                className="space-y-8"
                            >
                                
                                {/* Sección: Qué se borra */}
                                <motion.div variants={item} className="bg-background border rounded-xl p-6 shadow-sm">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                        <h3 className="font-headline text-lg font-bold">¿Qué eliminaremos?</h3>
                                    </div>
                                    <ul className="grid gap-3 ml-2">
                                        {[
                                            "Tu perfil completo (nombre, email, foto).",
                                            "Historial de compras y boletos pasados.",
                                            "Logs de acceso y preferencias guardadas."
                                        ].map((point, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                                <span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 shrink-0" />
                                                {point}
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>

                                {/* Sección: Pasos */}
                                <motion.div variants={item}>
                                    <h3 className="font-headline text-xl font-bold mb-6 flex items-center gap-2">
                                        <Mail className="w-5 h-5 text-primary" />
                                        Solicítalo en 3 pasos
                                    </h3>
                                    
                                    <div className="grid gap-4 md:grid-cols-3 text-center">
                                        {[
                                            { title: "1. Redacta", desc: "Usa el correo con el que te registraste.", icon: "✏️" },
                                            { title: "2. Destinatario", desc: supportEmail, icon: "📧" },
                                            { title: "3. Asunto", desc: 'Pon: "Eliminar mis Datos"', icon: "🏷️" }
                                        ].map((step, i) => (
                                            <div key={i} className="bg-primary/5 p-4 rounded-lg border border-primary/10 flex flex-col items-center">
                                                <div className="text-2xl mb-2">{step.icon}</div>
                                                <div className="font-bold text-sm mb-1">{step.title}</div>
                                                <div className="text-[11px] text-muted-foreground leading-tight">{step.desc}</div>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-lg border border-yellow-200 dark:border-yellow-900/30 flex gap-3 items-start">
                                        <ShieldAlert className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                                        <p className="text-xs md:text-sm text-yellow-800 dark:text-yellow-500">
                                            <strong>Nota de seguridad:</strong> Solo procesamos solicitudes que provengan del correo asociado a la cuenta por motivos de validación de identidad.
                                        </p>
                                    </div>
                                </motion.div>

                                {/* Sección: Tiempos */}
                                <motion.div variants={item} className="flex items-start gap-4 p-5 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                                    <CheckCircle2 className="w-6 h-6 text-green-600 mt-0.5 shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-green-700 dark:text-green-500 text-sm">Garantía de cumplimiento</h4>
                                        <p className="text-xs md:text-sm text-green-600/80 dark:text-green-400 mt-1 leading-relaxed">
                                            Una vez recibida la solicitud, procesaremos la purga total en un máximo de <strong>14 días hábiles</strong>. Te notificaremos vía email cuando el proceso haya finalizado.
                                        </p>
                                    </div>
                                </motion.div>

                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer de la página */}
                <div className="text-center mt-12">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">
                        © {new Date().getFullYear()} MiBoletoNi Nicaragua
                    </p>
                </div>
            </div>
        </div>
    );
}