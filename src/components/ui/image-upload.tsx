'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useStorage } from '@/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
  folder?: string;
  className?: string;
}

export function ImageUpload({
  value,
  onChange,
  disabled,
  folder = 'images',
  className,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storage = useStorage();
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
        toast({
            variant: "destructive",
            title: "Archivo inválido",
            description: "Por favor, sube solo archivos de imagen (PNG, JPG, WEBP).",
        });
        return;
    }

    // Validate size (e.g., 5MB)
    if (file.size > 5 * 1024 * 1024) {
         toast({
            variant: "destructive",
            title: "Archivo muy grande",
            description: "El tamaño máximo permitido es 5MB.",
        });
        return;
    }

    if (!storage) {
        toast({
            variant: "destructive",
            title: "Error de configuración",
            description: "No se pudo conectar con el servicio de almacenamiento.",
        });
        return;
    }

    try {
        setIsUploading(true);
        setProgress(0);

        // Create a unique filename: folder/timestamp-random-filename
        const timestamp = Date.now();
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        const storagePath = `${folder}/${timestamp}-${cleanFileName}`;
        const storageRef = ref(storage, storagePath);

        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progressValue = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setProgress(progressValue);
            },
            (error) => {
                console.error("Upload failed", error);
                toast({
                    variant: "destructive",
                    title: "Error al subir",
                    description: "No se pudo subir la imagen. Inténtalo de nuevo.",
                });
                setIsUploading(false);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    onChange(downloadURL);
                    toast({
                        title: "Imagen subida",
                        description: "La imagen se ha cargado correctamente.",
                    });
                } catch (err) {
                    console.error("Error getting download URL", err);
                } finally {
                    setIsUploading(false);
                }
            }
        );

    } catch (error) {
        console.error("Error starting upload", error);
        setIsUploading(false);
    }
  };

  const onFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
        setDragActive(true);
    } else if (e.type === 'dragleave') {
        setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className={cn("space-y-4 w-full", className)}>
      {value ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted border">
             <div className="absolute top-2 right-2 z-10">
                <Button variant="destructive" size="icon" onClick={handleRemove} disabled={disabled || isUploading}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
            <Image
                src={value}
                alt="Uploaded image"
                fill
                className="object-cover"
                unoptimized
            />
        </div>
      ) : (
        <div 
            className={cn(
                "relative flex flex-col items-center justify-center w-full aspect-video rounded-lg border-2 border-dashed transition-colors",
                dragActive ? "border-primary bg-primary/10" : "border-muted-foreground/25 bg-muted/50",
                disabled && "opacity-50 cursor-not-allowed",
                !disabled && "cursor-pointer hover:bg-muted"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !disabled && fileInputRef.current?.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileSelect}
                disabled={disabled}
            />
            {isUploading ? (
                <div className="flex flex-col items-center space-y-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Subiendo... {Math.round(progress)}%</p>
                </div>
            ) : (
                <div className="flex flex-col items-center space-y-2 text-center p-4">
                    <div className="p-4 rounded-full bg-background border shadow-sm">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium">Haz click para subir o arrastra una imagen</p>
                        <p className="text-sm text-muted-foreground">Soporta: JPG, PNG, WEBP (Max 5MB)</p>
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  );
}
