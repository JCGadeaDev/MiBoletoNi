import { cn } from "@/lib/utils";

export function PageHeader({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("flex items-center justify-between space-y-2", className)}>
            {children}
        </div>
    );
}

export function PageHeaderTitle({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <h2 className={cn("text-3xl font-bold tracking-tight", className)}>{children}</h2>;
}

export function PageHeaderActions({
    children,
    className,
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return <div className={cn("flex items-center space-x-2", className)}>{children}</div>;
}