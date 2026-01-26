import type { Metadata } from 'next';
import './globals.css';
import 'flag-icons/css/flag-icons.min.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Inter } from 'next/font/google'; 

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
        className={`${inter.variable} font-sans antialiased min-h-screen bg-background text-foreground`} 
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            
            {/* IMPORTANTE: 
                Aquí ya NO hay Header ni Footer. 
                Se renderizarán automáticamente según el Layout del grupo 
                donde se encuentre la página ((main) o (admin)).
            */}
            <div className="relative flex min-h-screen flex-col">
              {children}
            </div>
            
            <Toaster />

          </FirebaseClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}