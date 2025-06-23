'use client';

import { useState } from 'react';
import { User, AuthProvider } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider, facebookProvider, linkWithPopup } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserProfileDisplay from './UserProfileDisplay';
import UserProfileForm from './UserProfileForm';
import { PostsComponent } from './PostsComponent';
import { NotificationCenter } from './NotificationCenter';
import { PublicFeed } from './PublicFeed';
import { UserProfileForm as UserProfileFormType } from '@/types/user';

interface ProfileProps {
  user: User;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  const [message, setMessage] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { userProfile, loading, error, updateProfileData, createProfile } = useUserProfile(user);

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
  };  const handleProfileUpdate = async (profileData: UserProfileFormType) => {
    try {
      if (userProfile) {
        // Si ya existe un perfil, actualizarlo
        await updateProfileData(profileData);
        setMessage('¡Perfil actualizado correctamente!');
      } else {
        // Si no existe, crear uno nuevo
        await createProfile(profileData);
        setMessage('¡Perfil creado correctamente!');
      }
      setIsEditing(false);
    } catch {
      setMessage('Error al guardar el perfil');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Cargando perfil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header con notificaciones */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
          <NotificationCenter />
        </div>
          <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Mi Perfil</TabsTrigger>
            <TabsTrigger value="posts">Mis Posts</TabsTrigger>
            <TabsTrigger value="feed">Feed Público</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-6">
            {/* Perfil del Usuario */}
            <div>
              {userProfile && !isEditing ? (
                <UserProfileDisplay 
                  userProfile={userProfile} 
                  onEdit={() => setIsEditing(true)} 
                />
              ) : (
                <UserProfileForm
                  initialData={{
                    address: userProfile?.address || '',
                    birthDate: userProfile?.birthDate || ''
                  }}
                  onSubmit={handleProfileUpdate}
                  loading={loading}
                />
              )}
              
              {isEditing && (
                <div className="flex justify-center mt-4">
                  <Button 
                    onClick={() => setIsEditing(false)} 
                    variant="outline"
                  >
                    Cancelar
                  </Button>
                </div>
              )}
            </div>

            {/* Configuración de Autenticación */}
            <Card className="w-full max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-center">
                  Configuración de Cuenta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
              </CardContent>
            </Card>
          </TabsContent>
            <TabsContent value="posts" className="space-y-6">
            <PostsComponent user={user} />
          </TabsContent>
          
          <TabsContent value="feed" className="space-y-6">
            <PublicFeed />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
