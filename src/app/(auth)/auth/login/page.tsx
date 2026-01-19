'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { useAuth, useFirestore } from "@/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { setDoc, doc, getDoc, serverTimestamp } from "firebase/firestore";
import { signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, signInWithEmailAndPassword, FacebookAuthProvider, setPersistence, browserSessionPersistence, browserLocalPersistence, onIdTokenChanged, type User, updateProfile, sendEmailVerification, signOut } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { countryCodes } from "@/lib/country-codes";

async function createSessionCookie(user: User) {
    // Critical: Before creating a session, reload the user to get the latest state
    // including the email_verified status.
    await user.reload();

    // Now, check the reloaded user's verification status.
    if (!user.emailVerified) {
        throw new Error('El correo electrónico no ha sido verificado.');
    }

    const idToken = await user.getIdToken(true);
    
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Session creation failed:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to create session cookie.');
    }
    
    const result = await response.json();
    return { role: result.role };
}

export async function clearSessionCookie() {
    await fetch('/api/auth/session', { method: 'DELETE' });
}


const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
    rememberMe: z.boolean().default(false),
});

const registerSchema = z.object({
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    email: z.string().email('Email inválido'),
    countryCode: z.string().min(1, 'El código de país es requerido'),
    phone: z.string().regex(/^\d+$/, "Solo se permiten números").min(8, 'El número de teléfono es requerido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
    promotionsAccepted: z.boolean().default(false).optional(),
    acceptTerms: z.literal(true, {
        errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
    }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});


function LoginForm() {
    const auth = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const redirectUrl = searchParams.get('redirect');

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: false },
    });

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        if (!auth) return;
        try {
            const persistence = values.rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistence);
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            
            const user = userCredential.user;

            // Check for email verification
            if (!user.emailVerified) {
                toast({
                    variant: 'destructive',
                    title: 'Verificación requerida',
                    description: 'Tu correo electrónico aún no ha sido verificado. Por favor, revisa tu bandeja de entrada.',
                });
                await signOut(auth); // Sign out the user
                return;
            }

            const sessionData = await createSessionCookie(userCredential.user);

            // FORCE TOKEN REFRESH: This is critical. The session API updated the user's claims on the backend.
            // We must force the client SDK to fetch a NEW token with these claims before we reload/redirect.
            await userCredential.user.getIdToken(true);
            
            const destination = redirectUrl || (sessionData.role === 'admin' ? '/admin' : '/dashboard');
            window.location.href = destination; // Force full page reload
    
        } catch (error: any) {
             let title = 'Error al iniciar sesión';
            let description = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
    
            if (error.code === 'auth/invalid-credential') {
                title = 'Credenciales incorrectas';
                description = 'El email o la contraseña son incorrectos. Verifica tus datos e intenta de nuevo.';
            } else if (error.code === 'auth/user-not-found') {
                title = 'Usuario no encontrado';
                description = 'No existe una cuenta con este correo electrónico. ¿Quizás quisiste decir registrarte?';
            } else if (error.code === 'auth/wrong-password') {
                title = 'Contraseña incorrecta';
                description = 'La contraseña ingresada no es válida. Inténtalo de nuevo.';
            } else if (error.code === 'auth/too-many-requests') {
                 title = 'Demasiados intentos';
                 description = 'Has intentado iniciar sesión demasiadas veces. Por favor espera unos minutos.';
            } else {
                console.error('Login error:', error);
            }
            
            toast({
                variant: 'destructive',
                title: title,
                description: description,
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="flex items-center justify-between">
                    <FormField
                        control={form.control}
                        name="rememberMe"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                    Recuérdame
                                </FormLabel>
                            </FormItem>
                        )}
                    />
                    <Button asChild variant="link" className="p-0 h-auto text-sm">
                        <Link href="/auth/reset-password">¿Olvidó su contraseña?</Link>
                    </Button>
                </div>
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Ingresando...' : 'Ingresar'}
                </Button>
            </form>
        </Form>
    );
}

function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
    const auth = useAuth();
    const firestore = useFirestore(); // Initialize hook at top level
    const { toast } = useToast();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { firstName: '', lastName: '', email: '', countryCode: '+505', phone: '', password: '', confirmPassword: '', promotionsAccepted: false },
    });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        if (!auth || !firestore) return; // Ensure firestore is available
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            
            await sendEmailVerification(user);

            const fullName = `${values.firstName} ${values.lastName}`;
            await updateProfile(user, { displayName: fullName });

            // Create Firestore User Document
            await setDoc(doc(firestore, 'users', user.uid), {
                email: values.email,
                role: 'regular', // Default role
                name: fullName,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                countryCode: values.countryCode,
                emailVerified: false, // Initial state
                promotionsAccepted: values.promotionsAccepted || false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast({
                title: '¡Registro Exitoso!',
                description: 'Te hemos enviado un correo. Por favor, verifica tu dirección de email antes de iniciar sesión.',
                duration: 6000,
            });
            
            onSwitchToLogin(); 
            
        } catch (error: any) {
            let title = 'Error al crear la cuenta';
            let description = 'Ocurrió un error inesperado. Por favor, intenta de nuevo.';
    
            if (error.code === 'auth/email-already-in-use') {
                title = 'Email ya registrado';
                description = 'La dirección de correo electrónico que ingresaste ya está en uso. Intenta iniciar sesión.';
            } else {
                console.error('Registration error:', error);
            }
    
            toast({
                variant: 'destructive',
                title: title,
                description: description,
            });
        }
    };
    
    const selectedCountry = countryCodes.find(c => c.dial_code === form.watch('countryCode'));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                     <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu Nombre" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Apellido</FormLabel>
                                <FormControl>
                                    <Input placeholder="Tu Apellido" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="tu@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div>
                    <FormLabel>Teléfono</FormLabel>
                    <div className="flex gap-2">
                        <FormField
                            control={form.control}
                            name="countryCode"
                            render={({ field }) => (
                                <FormItem className="w-1/3">
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue asChild>
                                                    <div className="flex items-center gap-2">
                                                        {selectedCountry && <span className={`fi fi-${selectedCountry.code.toLowerCase()}`}></span>}
                                                        <span>{selectedCountry?.dial_code}</span>
                                                    </div>
                                                </SelectValue>
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {countryCodes.map(c => (
                                                <SelectItem key={c.code} value={c.dial_code}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`fi fi-${c.code.toLowerCase()}`}></span>
                                                        <span>{c.name} ({c.dial_code})</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem className="w-2/3">
                                    <FormControl>
                                        <Input placeholder="8888-8888" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Confirmar Contraseña</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="promotionsAccepted"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Acepto el envío de ofertas y promociones.
                                </FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    He leído y acepto los <Link href="/terms" className="text-primary underline">términos y condiciones</Link> y la <Link href="/privacy" className="text-primary underline">política de privacidad</Link>.
                                </FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Registrando...' : 'Registrarse'}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                    ¿Ya tienes una cuenta?{' '}
                    <Button variant="link" className="p-0 h-auto" type="button" onClick={onSwitchToLogin}>
                        Inicia Sesión
                    </Button>
                </div>
            </form>
        </Form>
    );
}

const SocialLogin = () => {
    const auth = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const redirectUrl = searchParams.get('redirect');

    const handleSocialSignIn = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
        if (!auth) return;
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
    
            await user.reload(); // IMPORTANT: Get the latest user state from Firebase
            if (!user.emailVerified) {
                toast({
                    variant: 'destructive',
                    title: 'Verificación requerida',
                    description: 'Tu correo electrónico aún no ha sido verificado. Por favor, revisa tu bandeja de entrada.',
                });
                await signOut(auth);
                return;
            }

            const sessionData = await createSessionCookie(user);
    
            // FORCE TOKEN REFRESH: Same critical fix as LoginForm. Ensure claims are up to date.
            await user.getIdToken(true);

            const destination = redirectUrl || (sessionData.role === 'admin' ? '/admin' : '/dashboard');
            window.location.href = destination; // Force full page reload
    
        } catch (error) {
            let title = 'Error de autenticación';
            let description = 'No se pudo iniciar sesión. Por favor, inténtalo de nuevo.';
            
            if (error instanceof FirebaseError) {
                if (error.code === 'auth/account-exists-with-different-credential') {
                    title = 'Cuenta ya existe';
                    description = 'Ya existe una cuenta con este email pero con un método de inicio de sesión diferente.';
                } else if (error.code === 'auth/popup-closed-by-user') {
                    title = 'Ventana cerrada';
                    description = 'El inicio de sesión fue cancelado.';
                }
            }

             toast({
                variant: 'destructive',
                title: title,
                description: description,
            });
        }
    };
    
    const handleGoogleSignIn = () => handleSocialSignIn(new GoogleAuthProvider());
    const handleFacebookSignIn = () => handleSocialSignIn(new FacebookAuthProvider());

    return (
        <>
            <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                        O continúa con
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
                    <FaGoogle className="mr-2 h-5 w-5" />
                    Google
                </Button>
                 <Button variant="outline" className="w-full" onClick={handleFacebookSignIn}>
                    <FaFacebook className="mr-2 h-5 w-5" />
                    Facebook
                </Button>
            </div>
        </>
    )
}


export default function AuthPage() {
    const [activeTab, setActiveTab] = useState('login');

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Crear Cuenta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Iniciar Sesión</CardTitle>
                        <CardDescription>Ingresa a MiBoletoNi para ver tus boletos</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <LoginForm />
                        <SocialLogin />
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="register">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline text-2xl">Crear Cuenta</CardTitle>
                        <CardDescription>Únete y accede a tus boletos en cualquier momento.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
                        <SocialLogin />
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    );
}

    