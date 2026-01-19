import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { EventProvider } from '@/context/EventContext';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <EventProvider>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </EventProvider>
  );
}
