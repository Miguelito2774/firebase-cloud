'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import type { CreatePostData } from '../types/post';

interface CreatePostFormProps {
  onSubmit: (data: CreatePostData) => Promise<boolean>;
  loading?: boolean;
}

export function CreatePostForm({ onSubmit, loading = false }: CreatePostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({ title: title.trim(), content: content.trim() });
    
    if (success) {
      setTitle('');
      setContent('');
    }
    
    setIsSubmitting(false);
  };

  const isDisabled = loading || isSubmitting || !title.trim() || !content.trim();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Crear Nuevo Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              placeholder="Escribe el título de tu post..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Contenido</Label>
            <Textarea
              id="content"
              placeholder="Escribe el contenido de tu post..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isSubmitting}
              rows={5}
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isDisabled}
            className="w-full"
          >
            {isSubmitting ? 'Creando...' : 'Crear Post'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
