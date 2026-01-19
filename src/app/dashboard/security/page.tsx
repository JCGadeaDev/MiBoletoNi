
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useUser, useAuth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut } from "firebase/auth";
import Link from "next/link";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { FirebaseError } from "firebase/app";
import { clearSessionCookie } from "@/app/(auth)/auth/login/page";

export default function SecurityPage() {
    const { user, isUserLoading } = useUser();
    const auth = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isUserLoading && !user) {
            router.replace('/auth?redirect=/dashboard/security');
        }
    }, [user, isUserLoading, router]);

    const handleChangePassword = async () => {
        if (!auth?.currentUser?.email) {
            toast({ variant: "destructive", title: "Operación no permitida", description: "El cambio de contraseña solo está disponible para cuentas con email y contraseña." });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({ variant: "destructive", title: "Error", description: "Las contraseñas nuevas no coinciden." });
            return;
        }
        if (newPassword.length < 6) {
             toast({ variant: "destructive", title: "Contraseña muy corta", description: "La nueva contraseña debe tener al menos 6 caracteres." });
            return;
        }

        setIsLoading(true);
        try {
            const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
            await reauthenticateWithCredential(auth.currentUser, credential);
            await updatePassword(auth.currentUser, newPassword);
            
            toast({ title: "¡Éxito!", description: "Tu contraseña ha sido actualizada. Por favor, inicia sesión de nuevo." });
            
            // Logout and redirect user
            await signOut(auth);
            await clearSessionCookie();
            router.push('/auth');

        } catch (error: any) {
            let title = "Error al cambiar la contraseña";
            let description = "Ocurrió un error inesperado. Por favor, intenta de nuevo.";

            if (error instanceof FirebaseError) {
                 switch (error.code) {
                    case 'auth/wrong-password':
                    case 'auth/invalid-credential':
                        title = 'Contraseña incorrecta';
                        description = "La contraseña actual que ingresaste es incorrecta. Por favor, verifica y vuelve a intentarlo.";
                        break;
                    case 'auth/requires-recent-login':
                         title = 'Se requiere reautenticación';
                        description = "Esta operación es sensible y requiere una autenticación reciente. Por favor, inicie sesión de nuevo antes de reintentar.";
                        break;
                    default:
                        // Se usan los mensajes por defecto para otros errores de Firebase
                        break;
                }
            }
           
            toast({ variant: "destructive", title, description });
        } finally {
            setIsLoading(false);
        }
    };

    if (isUserLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }
    
    const isEmailProvider = auth.currentUser?.providerData.some(
        (provider) => provider.providerId === 'password'
    );

    return (
        <div className="container py-8 sm:py-12">
            <div className="max-w-2xl mx-auto">
                 <Button variant="ghost" asChild className="mb-4 -ml-4">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver a Mi Cuenta
                    </Link>
                </Button>
                <Card>
                    <CardHeader>
                        <CardTitle>Seguridad</CardTitle>
                        <CardDescription>
                            {isEmailProvider 
                                ? "Modifica tu contraseña para mantener tu cuenta segura."
                                : "Gestionas tu inicio de sesión a través de tu proveedor social."}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isEmailProvider ? (
                            <>
                                <div>
                                    <label className="text-sm font-medium">Contraseña Actual</label>
                                    <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Contraseña Nueva</label>
                                    <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Confirme la Contraseña Nueva</label>
                                    <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                                </div>
                                <Button onClick={handleChangePassword} disabled={isLoading} className="w-full sm:w-auto">
                                    {isLoading ? 'Actualizando...' : 'Actualizar Contraseña'}
                                </Button>
                            </>
                        ) : (
                            <div className="flex items-start rounded-md border border-l-4 border-l-amber-400 bg-secondary p-4 text-secondary-foreground">
                                <ShieldAlert className="h-5 w-5 mr-3 mt-1 text-amber-500"/>
                                <div>
                                    <h4 className="font-semibold">Función no disponible</h4>
                                    <p className="text-sm text-muted-foreground">
                                        Iniciaste sesión con un proveedor externo (como Google o Facebook). Para cambiar tu contraseña, debes hacerlo directamente en la plataforma de dicho proveedor.
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
