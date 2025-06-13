'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/types/user';
import { CalendarDays, MapPin, User, Mail } from 'lucide-react';

interface UserProfileDisplayProps {
  userProfile: UserProfile;
  onEdit: () => void;
}

export default function UserProfileDisplay({ userProfile, onEdit }: UserProfileDisplayProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Perfil de Usuario
        </CardTitle>
        <Button onClick={onEdit} variant="outline" size="sm">
          Editar
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Nombre</span>
            </div>
            <p className="font-medium">{userProfile.displayName}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-4 w-4" />
              <span>Email</span>
            </div>
            <p className="font-medium">{userProfile.email}</p>
          </div>

          {userProfile.address && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>Dirección</span>
              </div>
              <p className="font-medium">{userProfile.address}</p>
            </div>
          )}

          {userProfile.birthDate && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CalendarDays className="h-4 w-4" />
                <span>Fecha de Nacimiento</span>
              </div>
              <p className="font-medium">{formatDate(userProfile.birthDate)}</p>
            </div>
          )}

          {userProfile.age && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>Edad</span>
              </div>
              <p className="font-medium">{userProfile.age} años</p>
            </div>
          )}
        </div>

        {(!userProfile.address || !userProfile.birthDate) && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              ¡Completa tu perfil! Agrega tu dirección y fecha de nacimiento para tener un perfil completo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
