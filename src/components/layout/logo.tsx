'use client';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('flex items-center', className)}>
      <Image
        src="/Logo.PNG"
        alt="MiBoletoNic Logo"
        width={240}
        height={52}
        className="h-auto w-[180px] md:w-[240px]"
        priority
      />
    </Link>
  );
}
