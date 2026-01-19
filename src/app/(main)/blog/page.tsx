'use client';
import { blogPosts } from '@/lib/data';
import { BlogPostCard } from '@/components/shared/blog-post-card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';

const heroImage = PlaceHolderImages.find(p => p.id === 'blog-hero');

export default function BlogPage() {
  const categories = ['Música', 'Entrevistas', 'Guías', 'Detrás de Escena'];
  return (
    <>
      <section className="relative py-20 md:py-28 bg-secondary">
        {heroImage && (
            <Image 
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
            />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-black/30" />
        <div className="container relative text-center">
            <h1 className="font-headline text-4xl md:text-5xl font-bold">
              El Magazine de MiBoletoNic
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-foreground/80">
              Guías, entrevistas y noticias de la escena cultural y de entretenimiento.
            </p>
        </div>
      </section>
      <div className="container py-12">
        <div className="flex justify-center mb-8">
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">Todo</TabsTrigger>
              {categories.map(category => (
                <TabsTrigger key={category} value={category.toLowerCase()}>{category}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <BlogPostCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </>
  );
}
