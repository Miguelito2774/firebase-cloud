import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserProfile, UserProfileForm } from '@/types/user';

export class UserRepository {
  private collectionName = 'users';

  // Crear o actualizar perfil de usuario
  async createOrUpdateUserProfile(
    uid: string, 
    email: string, 
    displayName: string, 
    profileData?: UserProfileForm
  ): Promise<UserProfile> {
    const userRef = doc(db, this.collectionName, uid);
    
    // Calcular edad si se proporciona fecha de nacimiento
    let age: number | undefined;
    if (profileData?.birthDate) {
      const birthDate = new Date(profileData.birthDate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }

    const userData: Partial<UserProfile> = {
      uid,
      email,
      displayName,
      updatedAt: new Date(),
      ...(profileData && {
        address: profileData.address,
        birthDate: profileData.birthDate,
        age
      })
    };

    // Verificar si el documento existe
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      // Actualizar documento existente
      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp()
      });
    } else {
      // Crear nuevo documento
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });    }

    // Retornar el perfil actualizado
    const updatedProfile = await this.getUserProfile(uid);
    if (!updatedProfile) {
      throw new Error('Error al obtener el perfil actualizado');
    }
    return updatedProfile;
  }
  // Obtener perfil de usuario
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, this.collectionName, uid);
    const docSnap = await getDoc(userRef);
    
    if (!docSnap.exists()) {
      return null; // Usuario no encontrado, retornar null en lugar de error
    }

    const data = docSnap.data();
    return {
      uid: data.uid,
      email: data.email,
      displayName: data.displayName,
      address: data.address,
      birthDate: data.birthDate,
      age: data.age,
      createdAt: data.createdAt instanceof Timestamp 
        ? data.createdAt.toDate() 
        : new Date(data.createdAt),
      updatedAt: data.updatedAt instanceof Timestamp 
        ? data.updatedAt.toDate() 
        : new Date(data.updatedAt)
    };
  }

  // Actualizar solo datos adicionales del perfil
  async updateUserProfileData(uid: string, profileData: UserProfileForm): Promise<UserProfile> {
    const userRef = doc(db, this.collectionName, uid);
    
    // Calcular edad
    let age: number | undefined;
    if (profileData.birthDate) {
      const birthDate = new Date(profileData.birthDate);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
    }    await updateDoc(userRef, {
      address: profileData.address,
      birthDate: profileData.birthDate,
      age,
      updatedAt: serverTimestamp()
    });

    const updatedProfile = await this.getUserProfile(uid);
    if (!updatedProfile) {
      throw new Error('Error al obtener el perfil actualizado');
    }
    return updatedProfile;
  }
}
