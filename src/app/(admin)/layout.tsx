import { Header } from "@/components/layout/header";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <div className="flex min-h-screen">
                <main className="flex-1">
                    {children}
                </main>
            </div>
        </>
    );
}
