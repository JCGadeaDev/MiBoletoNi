'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { Save, Edit, ArrowLeft, ShieldCheck, Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProfilePage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const { toast } = useToast();

    const [isEditing, setIsEditing] = useState(false);
    const [displayName, setDisplayName] = useState('');
    const [phone, setPhone] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Efecto para cargar datos y proteger la ruta
    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/auth?redirect=/dashboard/profile');
        }
        if (user) {
            setDisplayName(user.displayName || '');
            const fetchUserData = async () => {
                if (!firestore) return;
                const userDocRef = doc(firestore, "users", user.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setPhone(userDoc.data().phone || '');
                }
            };
            fetchUserData();
        }
    }, [user, isUserLoading, firestore, router]);

    const handleUpdateProfile = async () => {
        // SOLUCIÓN AL ERROR "user es posiblemente null":
        // Validamos todas las dependencias antes de proceder
        if (!user || !auth?.currentUser || !firestore) {
            toast({ 
                variant: 'destructive', 
                title: "Error", 
                description: "No se pudo identificar la sesión de usuario." 
            });
            return;
        }

        setIsLoading(true);

        try {
            // Actualizar en Firebase Auth
            await updateProfile(auth.currentUser, { displayName });

            // Actualizar en Firestore
            const userDocRef = doc(firestore, "users", user.uid);
            await setDoc(userDocRef, { 
                name: displayName, 
                phone,
                email: user.email,
                role: 'regular' // Valor por defecto para asegurar consistencia
            }, { merge: true });

            toast({ title: "Perfil Actualizado", description: "Tu información se ha guardado correctamente." });
            setIsEditing(false);
            router.refresh();

        } catch (error) {
            console.error("Error al actualizar el perfil:", error);
            toast({ variant: 'destructive', title: "Error", description: "No se pudo actualizar tu perfil." });
        } finally {
            setIsLoading(false);
        }
    };
    
    // Estado de carga inicial
    if (isUserLoading || !user) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground animate-pulse">Cargando perfil...</p>
            </div>
        );
    }

    return (
        <div className="container py-8 sm:py-12">
            <div className="max-w-2xl mx-auto">
                 <Button variant="ghost" asChild className="mb-6 -ml-4 hover:bg-transparent text-muted-foreground hover:text-primary">
                    <Link href="/dashboard" className="flex items-center">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Mi Cuenta
                    </Link>
                </Button>
                
                <Card className="shadow-lg border-muted/40 overflow-hidden">
                    <div className="h-2 bg-primary" /> {/* Línea decorativa superior */}
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Información Personal</CardTitle>
                        <CardDescription>Edita cómo te ves en la plataforma de MiBoletoNi.</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="bg-muted/30 p-4 rounded-xl space-y-1">
                             <h3 className="font-headline text-2xl font-bold text-foreground">
                                {user.displayName || 'Usuario'}
                             </h3>
                             <p className="text-primary font-medium">{user.email}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 ml-1">Nombre Completo</label>
                                <Input 
                                    value={displayName} 
                                    onChange={(e) => setDisplayName(e.target.value)} 
                                    disabled={!isEditing}
                                    className="border-muted-foreground/20 focus:border-primary transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground/80 ml-1">Teléfono</label>
                                <Input 
                                    value={phone} 
                                    onChange={(e) => setPhone(e.target.value)} 
                                    disabled={!isEditing} 
                                    placeholder="+505 0000-0000"
                                    className="border-muted-foreground/20 focus:border-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="flex pt-4 border-t border-muted/50">
                            {isEditing ? (
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Button onClick={handleUpdateProfile} disabled={isLoading} className="flex-1 shadow-md">
                                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                    <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                                        Cancelar
                                    </Button>
                                </div>
                            ) : (
                                <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto shadow-md">
                                    <Edit className="mr-2 h-4 w-4" /> Editar Perfil
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* SECCIÓN DE SOPORTE TÉCNICO REUBICADA */}
                <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/10 text-center"
                >
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="text-primary w-6 h-6" />
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        ¿Necesitas soporte técnico?
                    </h3>
                    
                    <p className="text-muted-foreground mb-6 text-sm max-w-md mx-auto">
                        Si tienes problemas con tus boletos, el proceso de pago o la configuración de tu cuenta, estamos aquí para ayudarte.
                    </p>
                    
                    <Button asChild variant="outline" className="rounded-full px-8 hover:bg-primary hover:text-white transition-all shadow-sm">
                        <Link href="/contact">Contactar a Soporte</Link>
                    </Button>
                </motion.section>
            </div>
        </div>
    );
}