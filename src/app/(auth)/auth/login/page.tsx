'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

// Firebase e Infraestructura
import { useAuth, useFirestore } from "@/firebase";
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    sendEmailVerification, 
    updateProfile,
    browserLocalPersistence,
    browserSessionPersistence,
    setPersistence,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signInWithPopup
} from "firebase/auth";
import { setDoc, doc, updateDoc, serverTimestamp } from "firebase/firestore";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { countryCodes } from "@/lib/country-codes";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Loader2, ShieldCheck, LockKeyhole, ArrowRight } from "lucide-react";
import { FaGoogle, FaFacebook } from "react-icons/fa";

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
    countryCode: z.string().min(1, 'Requerido'),
    phone: z.string().min(8, 'Mínimo 8 dígitos'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
    promotionsAccepted: z.boolean().default(false),
    acceptTerms: z.literal(true, {
        errorMap: () => ({ message: 'Debes aceptar los términos y condiciones' }),
    }),
}).refine(data => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

// --- HELPERS ---

async function createSessionCookie(user: any) {
    await user.reload();
    const idToken = await user.getIdToken(true);
    const response = await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });
    if (!response.ok) throw new Error('Error al crear sesión.');
    return await response.json();
}

// --- COMPONENTE LOGIN ---

function LoginForm() {
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get('redirect');

    const [needsVerification, setNeedsVerification] = useState(false);

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
            
            if (!userCredential.user.emailVerified) {
                setNeedsVerification(true);
                toast({ variant: 'destructive', title: 'Verificación requerida' });
                return;
            }

            const sessionData = await createSessionCookie(userCredential.user);
            window.location.href = redirectUrl || (sessionData.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: 'Credenciales inválidas.' });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <AnimatePresence>
                    {needsVerification && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                            <Alert className="bg-amber-50 border-amber-200 rounded-2xl mb-4">
                                <Mail className="h-4 w-4 text-amber-600" />
                                <AlertTitle className="text-amber-800 font-bold">Verifica tu cuenta</AlertTitle>
                                <AlertDescription className="text-amber-700 text-xs text-balance">
                                    Hemos enviado un enlace a tu correo. Debes confirmar tu email antes de poder ingresar.
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="tu@email.com" {...field} className="rounded-xl h-12" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl><Input type="password" placeholder="••••••••" {...field} className="rounded-xl h-12" /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />

                <div className="flex items-center justify-between px-1 py-2">
                    <FormField control={form.control} name="rememberMe" render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormLabel className="text-xs font-medium cursor-pointer">Recuérdame</FormLabel>
                        </FormItem>
                    )} />
                    <Link href="/auth/reset-password" title="Recuperar" className="text-xs font-bold text-primary hover:underline transition-all">
                        ¿Olvidó su contraseña?
                    </Link>
                </div>

                <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg shadow-lg" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Ingresar'}
                </Button>
            </form>
        </Form>
    );
}

// --- COMPONENTE REGISTRO ---

function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
    const auth = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: { 
            firstName: '', lastName: '', email: '', 
            countryCode: '+505', phone: '', 
            password: '', confirmPassword: '', 
            promotionsAccepted: false 
        },
    });

    const onSubmit = async (values: z.infer<typeof registerSchema>) => {
        if (!auth || !firestore) return;
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            await sendEmailVerification(userCredential.user);
            await updateProfile(userCredential.user, { displayName: `${values.firstName} ${values.lastName}` });

            await setDoc(doc(firestore, 'users', userCredential.user.uid), {
                email: values.email,
                role: 'regular',
                name: `${values.firstName} ${values.lastName}`,
                phone: values.phone,
                countryCode: values.countryCode,
                emailVerified: false,
                promotionsAccepted: values.promotionsAccepted,
                createdAt: serverTimestamp(),
            });

            toast({ title: '¡Cuenta creada!', description: 'Revisa tu correo para verificar tu cuenta.' });
            onSwitchToLogin();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                        <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                        <FormItem><FormLabel>Apellido</FormLabel><FormControl><Input {...field} className="rounded-xl h-11" /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input placeholder="tu@email.com" {...field} className="rounded-xl h-11" /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="space-y-2">
                    <FormLabel>Teléfono</FormLabel>
                    <div className="flex gap-2">
                        <FormField control={form.control} name="countryCode" render={({ field }) => (
                            <FormItem className="w-[100px]">
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger className="rounded-xl h-11"><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent className="rounded-xl">{countryCodes.map(c => <SelectItem key={c.code} value={c.dial_code}>{c.dial_code}</SelectItem>)}</SelectContent>
                                </Select>
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl><Input placeholder="8888-8888" {...field} className="rounded-xl h-11" /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />
                    </div>
                </div>

                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" {...field} className="rounded-xl h-11" /></FormControl><FormMessage /></FormItem>
                )} />
                
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                    <FormItem><FormLabel>Confirmar Contraseña</FormLabel><FormControl><Input type="password" {...field} className="rounded-xl h-11" /></FormControl><FormMessage /></FormItem>
                )} />

                <div className="space-y-3 pt-2">
                    <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 p-1">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="leading-none">
                                <FormLabel className="text-xs cursor-pointer">Acepto los <Link href="/terms" className="text-primary underline font-bold">Términos y Condiciones</Link></FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )} />

                    <FormField control={form.control} name="promotionsAccepted" render={({ field }) => (
                        <FormItem className="flex items-start space-x-3 space-y-0 p-1">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <FormLabel className="text-xs leading-none cursor-pointer text-muted-foreground">Quiero recibir ofertas y promociones.</FormLabel>
                        </FormItem>
                    )} />
                </div>

                <Button type="submit" className="w-full h-14 rounded-xl font-bold text-lg shadow-lg mt-4" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : 'Registrarse'}
                </Button>
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

    const handleSocial = async (provider: any) => {
        if (!auth) return;
        try {
            const result = await signInWithPopup(auth, provider);
            const sessionData = await createSessionCookie(result.user);
            window.location.href = redirectUrl || (sessionData.role === 'admin' ? '/admin' : '/dashboard');
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
    };

    return (
        <div className="mt-6">
            <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">O continúa con</span></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="rounded-xl h-12" onClick={() => handleSocial(new GoogleAuthProvider())}><FaGoogle className="mr-2" /> Google</Button>
                <Button variant="outline" className="rounded-xl h-12" onClick={() => handleSocial(new FacebookAuthProvider())}><FaFacebook className="mr-2" /> Facebook</Button>
            </div>
        </div>
    );
}

// --- PÁGINA AUTH PRINCIPAL ---

export default function AuthPage() {
    const [activeTab, setActiveTab] = useState('login');

    return (
        <div className="flex flex-col gap-6 max-w-md mx-auto py-10 px-4 min-h-screen">
            <Alert className="bg-primary/5 border-primary/20 rounded-[2rem] p-6 shadow-sm">
                <ShieldCheck className="h-6 w-6 text-primary" />
                <AlertTitle className="font-bold text-lg ml-2">Tu seguridad es primero</AlertTitle>
                <AlertDescription className="text-xs ml-2 text-muted-foreground leading-relaxed">
                    En <strong>MiBoletoNi</strong> protegemos tus compras. Por ello, solo permitimos transacciones a usuarios verificados.
                </AlertDescription>
            </Alert>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-muted/50 rounded-2xl p-1 mb-6 h-12">
                    <TabsTrigger value="login" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Ingresar</TabsTrigger>
                    <TabsTrigger value="register" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Registrarse</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
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
                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-3xl font-black tracking-tight">Únete hoy</CardTitle>
                            <CardDescription>Crea tu cuenta en segundos para empezar.</CardDescription>
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