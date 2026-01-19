'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { BlogPost } from '@/lib/types';

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  // Usamos una imagen genérica si no hay ID, o picsum
  const imageUrl = post.image ? `/images/${post.image}` : `https://picsum.photos/seed/${post.id}/600/400`;

  return (
    <Link href="#" aria-label={post.title} className="block group h-full">
        <Card className="h-full overflow-hidden border-border/50 bg-card transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative aspect-[16/9] w-full overflow-hidden">
                <Image
                    src={imageUrl}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 left-4">
                    <Badge className="bg-primary/90 hover:bg-primary text-white border-none shadow-md">
                        {post.category}
                    </Badge>
                </div>
            </div>
            
            <CardContent className="p-6 flex flex-col h-[calc(100%-56.25%)]"> {/* Ajuste de altura para flex */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        <span>{post.author}</span>
                    </div>
                </div>

                <h3 className="font-headline text-xl font-bold leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                </h3>
                
                <p className="text-muted-foreground text-sm mb-6 line-clamp-3 flex-grow">
                    {post.excerpt}
                </p>

                <div className="flex items-center text-primary font-medium text-sm group/link">
                    Leer artículo
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                </div>
            </CardContent>
        </Card>
    </Link>
  );
}