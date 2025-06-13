'use client';

import { useState } from 'react';
import { FirebaseError } from 'firebase/app';
import { 
  auth, 
  googleProvider, 
  facebookProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Auth = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as FirebaseError).message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError((err as FirebaseError).message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError((err as FirebaseError).message);
    }
  };
  const handleFacebookSignIn = async () => {
    try {
      await signInWithPopup(auth, facebookProvider);
    } catch (err) {
      const firebaseError = err as FirebaseError;
      if (firebaseError.code === 'auth/account-exists-with-different-credential') {
        // Manejar caso de cuenta existente con diferentes credenciales
        setError('Esta cuenta ya existe con un proveedor diferente');
      } else {
        setError(firebaseError.message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-gray-900">
            Iniciar Sesión
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form className="space-y-4" onSubmit={handleEmailSignIn}>
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
                required
              />
            </div>
            <div className="space-y-3">
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Iniciar con Email
              </Button>
              <Button 
                type="button" 
                onClick={handleSignUp}
                variant="outline"
                className="w-full"
              >
                Registrar
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <Button 
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full"
            >
              Iniciar con Google
            </Button>
            <Button 
              onClick={handleFacebookSignIn}
              variant="outline"
              className="w-full"
            >
              Iniciar con Facebook
            </Button>
          </div>

          {error && (
            <div className="text-red-600 text-center text-sm font-medium">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
