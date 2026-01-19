import type { Metadata } from 'next';
import './globals.css';
import 'flag-icons/css/flag-icons.min.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter } from 'next/font/google'; // Importamos una fuente moderna y optimizada

// Configuración de la fuente Inter (Moderna, limpia y profesional)
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'MiBoletoNi - Tu Próxima Experiencia Inolvidable',
  description: 'Compra boletos de forma fácil y segura para los mejores eventos y espectáculos de Nicaragua.',
  // 1. Icono de la página (Favicon)
  icons: {
    icon: '/favicon.ico', // Debes tener este archivo en tu carpeta /public
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png', // Opcional: para dispositivos iOS
  },
  // 2. Verificación de Dominio de Facebook
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
        className={`${inter.variable} font-sans antialiased`} // Aplicamos la fuente aquí
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            {children}
            <Toaster />
          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}