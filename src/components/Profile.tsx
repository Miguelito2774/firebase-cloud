'use client';

import { useState } from 'react';
import { User, AuthProvider } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider, facebookProvider, linkWithPopup } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [message, setMessage] = useState<string>('');

  const isProviderLinked = (providerId: string): boolean => {
    return user.providerData.some(provider => provider.providerId === providerId);
  };
  const handleLinkProvider = async (provider: AuthProvider) => {
    try {
      await linkWithPopup(user, provider);
      setMessage('¡Proveedor asociado!');
    } catch (err) {
      setMessage(`Error: ${(err as FirebaseError).message}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      setMessage(`Error al cerrar sesión: ${(err as FirebaseError).message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Bienvenido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              <strong>{user.email}</strong>
            </p>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Proveedores vinculados:
              </h3>
              <ul className="space-y-1">
                {user.providerData.map(provider => (
                  <li key={provider.providerId} className="text-sm text-gray-600">
                    {provider.providerId.replace('.com', '')}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-3 mb-6">
              <Button 
                onClick={() => handleLinkProvider(googleProvider)}
                disabled={isProviderLinked('google.com')}
                variant="outline"
                className="w-full"
              >
                {isProviderLinked('google.com') ? 'Google Vinculado' : 'Vincular Google'}
              </Button>
              
              <Button 
                onClick={() => handleLinkProvider(facebookProvider)}
                disabled={isProviderLinked('facebook.com')}
                variant="outline"
                className="w-full"
              >
                {isProviderLinked('facebook.com') ? 'Facebook Vinculado' : 'Vincular Facebook'}
              </Button>
            </div>

            <Button 
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              Cerrar Sesión
            </Button>
            
            {message && (
              <div className="mt-4 text-sm text-center">
                <p className={message.includes('Error') ? 'text-red-600' : 'text-green-600'}>
                  {message}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
