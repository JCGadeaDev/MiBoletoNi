'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { setDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    FacebookAuthProvider, 
    setPersistence, 
    browserSessionPersistence, 
    browserLocalPersistence, 
    type User, 
    updateProfile, 
    sendEmailVerification, 
    signOut 
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { FirebaseError } from "firebase/app";
import { countryCodes } from "@/lib/country-codes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, AlertCircle, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- HELPERS DE AUTENTICACIÓN ---

async function syncEmailVerifiedStatus(firestore: any, user: User) {
    if (!firestore) return;
    const userDocRef = doc(firestore, 'users', user.uid);
    try {
        await updateDoc(userDocRef, {
            emailVerified: user.emailVerified,
            updatedAt: serverTimestamp()
        });
    } catch (e) {
        console.error("Error al sincronizar estado de verificación:", e);
    }
}

async function createSessionCookie(user: User) {
    await user.reload();
    if (!user.emailVerified) {
        throw new Error('El correo electrónico no ha sido verificado.');
    }
    const idToken = await user.getIdToken(true);
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Error al crear sesión.');
    }
    const result = await response.json();
    return { role: result.role };
}

// --- SCHEMAS DE VALIDACIÓN ---

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

// --- COMPONENTE LOGIN ---

function LoginForm() {
    const auth = useAuth();
    const firestore = useFirestore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const redirectUrl = searchParams.get('redirect');

    const [needsVerification, setNeedsVerification] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (cooldown > 0) {
            timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [cooldown]);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', rememberMe: false },
    });

    const handleResendEmail = async () => {
        if (!auth?.currentUser || cooldown > 0) return;
        setIsResending(true);
        try {
            await sendEmailVerification(auth.currentUser);
            toast({ title: "Enlace enviado", description: "Revisa tu bandeja de entrada." });
            setCooldown(60);
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Demasiados intentos. Prueba más tarde." });
        } finally {
            setIsResending(false);
        }
    };

    const onSubmit = async (values: z.infer<typeof loginSchema>) => {
        if (!auth) return;
        setNeedsVerification(false);
        try {
            const persistence = values.rememberMe ? browserLocalPersistence : browserSessionPersistence;
            await setPersistence(auth, persistence);
            const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;

            await user.reload();

            if (!user.emailVerified) {
                setNeedsVerification(true);
                toast({ variant: 'destructive', title: 'Verificación requerida', description: 'Por favor confirma tu email.' });
                return;
            }

            await syncEmailVerifiedStatus(firestore, user);
            const sessionData = await createSessionCookie(user);
            await user.getIdToken(true);
            window.location.href = redirectUrl || (sessionData.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error de acceso', description: 'Credenciales inválidas o correo no verificado.' });
        }
    };

    return (
        <div className="space-y-4">
            <AnimatePresence>
                {needsVerification && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <Alert className="bg-amber-50 border-amber-200 text-amber-900 mb-4 rounded-2xl">
                            <Mail className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="font-bold">Activa tu cuenta</AlertTitle>
                            <AlertDescription className="text-xs flex flex-col gap-2">
                                <span>Revisa tu email para verificar tu dirección.</span>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-fit h-auto py-1 px-3 text-xs" 
                                    onClick={handleResendEmail}
                                    disabled={cooldown > 0 || isResending}
                                >
                                    {isResending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                                    {cooldown > 0 ? `Reenviar en ${cooldown}s` : "Reenviar enlace"}
                                </Button>
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl><Input placeholder="tu@email.com" {...field} className="rounded-xl" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl><Input type="password" {...field} className="rounded-xl" /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <div className="flex items-center justify-between px-1 text-xs">
                        <FormField control={form.control} name="rememberMe" render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel className="cursor-pointer">Recuérdame</FormLabel>
                            </FormItem>
                        )} />
                        <Link href="/auth/reset-password text-primary font-semibold hover:underline">¿Olvidó su contraseña?</Link>
                    </div>
                    <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Ingresar'}
                    </Button>
                </form>
            </Form>
        </div>
    );
}

// --- COMPONENTE REGISTRO ---

function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { firstName: '', lastName: '', email: '', countryCode: '+505', phone: '', password: '', confirmPassword: '', promotionsAccepted: false },
    });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        if (!auth || !firestore) return;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
            await sendEmailVerification(user);
            const fullName = `${values.firstName} ${values.lastName}`;
            await updateProfile(user, { displayName: fullName });

            await setDoc(doc(firestore, 'users', user.uid), {
                email: values.email,
                role: 'regular',
                name: fullName,
                firstName: values.firstName,
                lastName: values.lastName,
                phone: values.phone,
                countryCode: values.countryCode,
                emailVerified: false,
                promotionsAccepted: values.promotionsAccepted || false,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            toast({ title: '¡Registro Exitoso!', description: 'Verifica tu correo antes de iniciar sesión.' });
            onSwitchToLogin(); 
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };
    
    const selectedCountry = countryCodes.find(c => c.dial_code === form.watch('countryCode'));

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="tu@email.com" {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                )} />
                <div className="space-y-2">
                    <FormLabel>Teléfono</FormLabel>
                    <div className="flex gap-2">
                        <FormField control={form.control} name="countryCode" render={({ field }) => (
                            <FormItem className="w-1/3">
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger className="rounded-xl">
                                            <SelectValue />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {countryCodes.map(c => (
                                            <SelectItem key={c.code} value={c.dial_code}>
                                                {c.dial_code}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem className="w-2/3"><FormControl><Input placeholder="8888-8888" {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </div>
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirmar</FormLabel><FormControl><Input type="password" {...field} className="rounded-xl" /></FormControl><FormMessage /></FormItem>
                )} />
                <Button type="submit" className="w-full h-12 rounded-xl" disabled={form.formState.isSubmitting}>Crear Cuenta</Button>
                <p className="text-center text-xs">¿Ya tienes cuenta? <Button variant="link" onClick={onSwitchToLogin} className="p-0 h-auto text-xs">Inicia Sesión</Button></p>
            </form>
        </Form>
    );
}

// --- SOCIAL LOGIN ---

function SocialLogin() {
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    const handleSocial = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
        if (!auth) return;
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            await user.reload();
            if (!user.emailVerified) {
                toast({ variant: 'destructive', title: 'Verificación requerida', description: 'Revisa tu email.' });
                await signOut(auth);
                return;
            }
            await syncEmailVerifiedStatus(firestore, user);
            const sessionData = await createSessionCookie(user);
            window.location.href = redirectUrl || (sessionData.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    return (
        <div className="mt-4 grid grid-cols-2 gap-2">
            <Button variant="outline" className="rounded-xl" onClick={() => handleSocial(new GoogleAuthProvider())}><FaGoogle className="mr-2" /> Google</Button>
            <Button variant="outline" className="rounded-xl" onClick={() => handleSocial(new FacebookAuthProvider())}><FaFacebook className="mr-2" /> Facebook</Button>
        </div>
    );
}

// --- PÁGINA AUTH ---

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState('login');

    return (
        <div className="flex flex-col gap-6 max-w-md mx-auto py-10 px-4">
            <Alert className="bg-primary/5 border-primary/20 rounded-3xl p-6">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <AlertTitle className="font-bold text-lg ml-2">Tu seguridad es primero</AlertTitle>
                <AlertDescription className="text-xs ml-2 text-muted-foreground leading-relaxed">
                    En <strong>MiBoletoNi</strong> protegemos tus compras. Por ello, solo permitimos transacciones a usuarios con correos electrónicos verificados.
                </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-2xl p-1 mb-6">
                    <TabsTrigger value="login" className="rounded-xl">Ingresar</TabsTrigger>
                    <TabsTrigger value="register" className="rounded-xl">Registrarse</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-3xl font-black tracking-tight">¡Hola de nuevo!</CardTitle>
                            <CardDescription>Ingresa para comprar tus boletos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <LoginForm />
                            <SocialLogin />
                        </CardContent>
                    </Card>
                </TabsContent>
                
                <TabsContent value="register">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-3xl font-black tracking-tight">Únete hoy</CardTitle>
                            <CardDescription>Crea tu cuenta en segundos.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RegisterForm onSwitchToLogin={() => setActiveTab('login')} />
                            <SocialLogin />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}