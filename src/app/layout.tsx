import type { Metadata } from 'next';
import './globals.css';
import 'flag-icons/css/flag-icons.min.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter } from 'next/font/google'; 

// --- CORRECCIÓN DE IMPORTACIONES ---
// 1. Usamos { } porque son exportaciones nombradas (export function Header)
// 2. Cambiamos 'Navbar' por 'Header' que es el componente que me mostraste
import { Header } from '@/components/layout/header'; 
import { Footer } from '@/components/layout/footer';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'MiBoletoNi - Tu Próxima Experiencia Inolvidable',
  description: 'Compra boletos de forma fácil y segura para los mejores eventos y espectáculos de Nicaragua.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  other: {
    "facebook-domain-verification": "4f1igs6vycdf8aba7dk5bxkupigrtm",
  },
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body 
        className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground`} 
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            
            {/* 1. HEADER (Tu componente Header.tsx) */}
            <Header />
            
            {/* 2. CONTENIDO PRINCIPAL */}
            <main className="flex-1 w-full flex flex-col relative"> 
              {children}
            </main>
            
            {/* 3. TOASTS */}
            <Toaster />

            {/* 4. FOOTER (Tu componente Footer.tsx) */}
            <Footer />
            
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}