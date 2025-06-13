'use client';

import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { UserProfile, UserProfileForm } from '@/types/user';
import { UserRepository } from '@/lib/userRepository';

const userRepository = new UserRepository();

export const useUserProfile = (user: User | null) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Cargar perfil cuando cambia el usuario
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }

    const loadUserProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        // Intentar obtener el perfil existente
        const profile = await userRepository.getUserProfile(user.uid);
        setUserProfile(profile); // Si es null, significa que no existe y está bien
      } catch (err) {
        console.error('Error obteniendo perfil:', err);
        setError('Error al cargar el perfil');
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [user]);
  // Actualizar datos adicionales del perfil
  const updateProfileData = async (profileData: UserProfileForm) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const updatedProfile = await userRepository.updateUserProfileData(user.uid, profileData);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (err) {
      console.error('Error actualizando perfil:', err);
      setError('Error al actualizar el perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };
  // Crear perfil por primera vez
  const createProfile = async (profileData: UserProfileForm) => {
    if (!user) return;

    setLoading(true);
    setError(null);
    try {
      const newProfile = await userRepository.createOrUpdateUserProfile(
        user.uid,
        user.email || '',
        user.displayName || 'Usuario',
        profileData
      );
      setUserProfile(newProfile);
      return newProfile;
    } catch (err) {
      console.error('Error creando perfil:', err);
      setError('Error al crear el perfil');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    userProfile,
    loading,
    error,
    updateProfileData,
    createProfile
  };
};
