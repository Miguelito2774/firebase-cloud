'use client';

import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ImageIcon, X } from 'lucide-react';

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void;
  selectedImage: File | null;
  loading?: boolean;
}

export function ImageUpload({ onImageSelect, selectedImage, loading = false }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      onImageSelect(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>Imagen (opcional)</Label>
      
      <Input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={loading}
        className="hidden"
      />
      
      {!preview ? (
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={loading}
          className="w-full h-24 border-dashed"
        >
          <div className="flex flex-col items-center gap-2">
            <ImageIcon className="h-6 w-6 text-gray-400" />
            <span className="text-sm text-gray-500">
              Hacer clic para seleccionar imagen
            </span>
          </div>
        </Button>
      ) : (
        <div className="relative">          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleRemove}
            disabled={loading}
            className="absolute top-2 right-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {selectedImage && (
        <p className="text-xs text-gray-500">
          {selectedImage.name} ({(selectedImage.size / 1024 / 1024).toFixed(2)} MB)
        </p>
      )}
    </div>
  );
}
