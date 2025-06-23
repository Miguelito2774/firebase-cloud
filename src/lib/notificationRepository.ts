import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { 
  NotificationProfile, 
  NotificationMessage, 
  NotificationSubscription,
  CreateNotificationData 
} from '../types/notification';

export class NotificationRepository {
  private profilesCollection = 'notification_profiles';
  private subscriptionsCollection = 'notification_subscriptions';
  private messagesCollection = 'notification_messages';

  // Perfil de notificaciones
  async createOrUpdateNotificationProfile(uid: string, token?: string): Promise<NotificationProfile> {
    const profileRef = doc(db, this.profilesCollection, uid);
    const profileDoc = await getDoc(profileRef);
    
    const now = new Date();
    
    if (profileDoc.exists()) {
      const profile = profileDoc.data() as NotificationProfile;
      const updateData: Partial<NotificationProfile> = {
        updatedAt: now
      };
      
      if (token && !profile.notificationTokens.includes(token)) {
        updateData.notificationTokens = [...profile.notificationTokens, token];
      }
      
      await updateDoc(profileRef, updateData);
      return { ...profile, ...updateData };
    } else {
      const newProfile: NotificationProfile = {
        uid,
        notificationTokens: token ? [token] : [],
        followedUsers: [],
        isNotificationsEnabled: true,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(profileRef, {
        ...newProfile,
        createdAt: Timestamp.fromDate(newProfile.createdAt),
        updatedAt: Timestamp.fromDate(newProfile.updatedAt)
      });
      
      return newProfile;
    }
  }

  async getNotificationProfile(uid: string): Promise<NotificationProfile | null> {
    const profileDoc = await getDoc(doc(db, this.profilesCollection, uid));
    if (!profileDoc.exists()) return null;
    
    const data = profileDoc.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as NotificationProfile;
  }
  // Suscripciones (seguir usuarios)
  async followUser(followerId: string, followedId: string): Promise<void> {
    if (followerId === followedId) return;
    
    // Asegurar que ambos usuarios tienen perfiles
    await this.createOrUpdateNotificationProfile(followerId);
    await this.createOrUpdateNotificationProfile(followedId);
    
    // Crear la suscripción
    const subscription: NotificationSubscription = {
      followerId,
      followedId,
      createdAt: new Date()
    };
    
    await addDoc(collection(db, this.subscriptionsCollection), {
      ...subscription,
      createdAt: Timestamp.fromDate(subscription.createdAt)
    });
    
    // Actualizar el perfil del seguidor
    const followerProfileRef = doc(db, this.profilesCollection, followerId);
    await updateDoc(followerProfileRef, {
      followedUsers: arrayUnion(followedId),
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  async unfollowUser(followerId: string, followedId: string): Promise<void> {
    // Buscar y eliminar la suscripción
    const subscriptionsQuery = query(
      collection(db, this.subscriptionsCollection),
      where('followerId', '==', followerId),
      where('followedId', '==', followedId)
    );
    
    const subscriptionDocs = await getDocs(subscriptionsQuery);
    const batch = [];
    
    subscriptionDocs.forEach((docSnapshot) => {
      batch.push(docSnapshot.ref);
    });
    
    // Actualizar el perfil del seguidor
    const followerProfileRef = doc(db, this.profilesCollection, followerId);
    await updateDoc(followerProfileRef, {
      followedUsers: arrayRemove(followedId),
      updatedAt: Timestamp.fromDate(new Date())
    });
  }

  async getFollowers(userId: string): Promise<string[]> {
    const followersQuery = query(
      collection(db, this.subscriptionsCollection),
      where('followedId', '==', userId)
    );
    
    const followersSnapshot = await getDocs(followersQuery);
    return followersSnapshot.docs.map(doc => doc.data().followerId);
  }

  async getFollowing(userId: string): Promise<string[]> {
    const profile = await this.getNotificationProfile(userId);
    return profile?.followedUsers || [];
  }

  async isFollowing(followerId: string, followedId: string): Promise<boolean> {
    const profile = await this.getNotificationProfile(followerId);
    return profile?.followedUsers.includes(followedId) || false;
  }

  // Mensajes de notificación
  async createNotification(data: CreateNotificationData): Promise<void> {
    const notification: NotificationMessage = {
      ...data,
      read: false,
      createdAt: new Date()
    };
    
    await addDoc(collection(db, this.messagesCollection), {
      ...notification,
      createdAt: Timestamp.fromDate(notification.createdAt)
    });
  }

  async getUserNotifications(userId: string, limitCount = 20): Promise<NotificationMessage[]> {
    const notificationsQuery = query(
      collection(db, this.messagesCollection),
      where('recipientId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(notificationsQuery);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    } as NotificationMessage));
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    const notificationRef = doc(db, this.messagesCollection, notificationId);
    await updateDoc(notificationRef, { read: true });
  }

  async getUnreadCount(userId: string): Promise<number> {
    const unreadQuery = query(
      collection(db, this.messagesCollection),
      where('recipientId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(unreadQuery);
    return snapshot.size;
  }
}
