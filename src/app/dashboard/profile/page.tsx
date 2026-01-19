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
import { Save, Edit, ArrowLeft } from "lucide-react";
import Link from "next/link";

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
        if (!auth?.currentUser || !firestore) return;
        setIsLoading(true);

        try {
            await updateProfile(auth.currentUser, { displayName });

            const userDocRef = doc(firestore, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                await setDoc(userDocRef, { name: displayName, phone }, { merge: true });
            } else {
                await setDoc(userDocRef, { 
                    name: displayName, 
                    phone,
                    email: user.email,
                    role: 'regular' // Required for creation
                });
            }

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
    
    if (isUserLoading || !user) {
        return <div className="flex h-screen items-center justify-center">Cargando...</div>;
    }

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
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>Aquí puedes ver y editar la información de tu perfil.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                             <h3 className="font-headline text-2xl font-semibold">{user.displayName || 'Bienvenido'}</h3>
                             <p className="text-muted-foreground">{user.email}</p>
                             <p className="text-sm text-muted-foreground">El correo electrónico no puede ser modificado.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium">Nombre Completo</label>
                                    <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={!isEditing} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium">Teléfono</label>
                                    <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!isEditing} placeholder="Ej: +505 8888-8888"/>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                            {isEditing ? (
                                <Button onClick={handleUpdateProfile} disabled={isLoading}>
                                    <Save className="mr-2 h-4 w-4" /> {isLoading ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            ) : (
                                <Button onClick={() => setIsEditing(true)}>
                                    <Edit className="mr-2 h-4 w-4" /> Editar Perfil
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
