'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserProfileForm } from '@/types/user';

const profileSchema = z.object({
  address: z.string().min(1, 'La dirección es requerida'),
  birthDate: z.string().min(1, 'La fecha de nacimiento es requerida')
});

interface UserProfileFormProps {
  initialData?: Partial<UserProfileForm>;
  onSubmit: (data: UserProfileForm) => Promise<void>;
  loading?: boolean;
}

export default function UserProfileFormComponent({ 
  initialData, 
  onSubmit, 
  loading = false 
}: UserProfileFormProps) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UserProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      address: initialData?.address || '',
      birthDate: initialData?.birthDate || ''
    }
  });

  const handleFormSubmit = async (data: UserProfileForm) => {
    setSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Datos del Perfil</CardTitle>
        <CardDescription>
          Completa tu información personal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              type="text"
              placeholder="Ingresa tu dirección"
              {...register('address')}
            />
            {errors.address && (
              <p className="text-sm text-red-600">{errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
            <Input
              id="birthDate"
              type="date"
              {...register('birthDate')}
            />
            {errors.birthDate && (
              <p className="text-sm text-red-600">{errors.birthDate.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={submitting || loading}
          >
            {submitting ? 'Guardando...' : 'Guardar Información'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
