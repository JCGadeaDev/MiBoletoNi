import { Logo } from "@/components/layout/logo";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-secondary/30">
        <header className="bg-background border-b">
            <div className="container flex h-16 items-center justify-between">
                <Logo />
                <div className="flex items-center gap-4">
                   <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        <span>Pago Seguro</span>
                   </div>
                </div>
            </div>
        </header>
      <main className="py-8 md:py-12">
        {children}
      </main>
      <footer className="py-6 text-center text-xs text-muted-foreground">
        <Link href="/">&copy; {new Date().getFullYear()} MiBoletoNic</Link>
      </footer>
    </div>
  );
}
