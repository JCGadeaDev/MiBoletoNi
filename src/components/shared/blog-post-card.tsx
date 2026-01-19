import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { BlogPost } from '@/lib/types';

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  const placeholder = PlaceHolderImages.find(p => p.id === post.image);
  const imageUrl = placeholder?.imageUrl ?? `https://picsum.photos/seed/${post.id}/600/400`;
  const imageHint = placeholder?.imageHint ?? 'blog photo';

  return (
    <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-xl">
      <Link href="#" aria-label={post.title}>
        <CardContent className="p-0">
          <div className="relative aspect-[16/9] w-full">
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              data-ai-hint={imageHint}
            />
          </div>
          <div className="p-6">
            <Badge variant="secondary" className="mb-2">{post.category}</Badge>
            <h3 className="font-headline text-xl font-semibold leading-tight mb-2">
              {post.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center">
                <User className="mr-1.5 h-3 w-3" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-1.5 h-3 w-3" />
                <span>{post.date}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
