import { useEffect, useState, useCallback, useMemo } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { onAuthStateChanged, User } from 'firebase/auth';
import { messaging, auth } from '../lib/firebase';
import { NotificationRepository } from '../lib/notificationRepository';
import type { NotificationMessage } from '../types/notification';

export function useNotifications() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);  const [loading, setLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  
  const notificationRepo = useMemo(() => new NotificationRepository(), []);

  // Cargar notificaciones del usuario
  const loadNotifications = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const userNotifications = await notificationRepo.getUserNotifications(user.uid);
      setNotifications(userNotifications);
      
      const unread = await notificationRepo.getUnreadCount(user.uid);
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user, notificationRepo]);

  // Marcar notificación como leída
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationRepo.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Seguir usuario
  const followUser = async (userId: string) => {
    if (!user || user.uid === userId) return false;
    
    try {
      await notificationRepo.followUser(user.uid, userId);
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  };

  // Dejar de seguir usuario
  const unfollowUser = async (userId: string) => {
    if (!user) return false;
    
    try {
      await notificationRepo.unfollowUser(user.uid, userId);
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  };

  // Verificar si sigue a un usuario
  const isFollowing = async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      return await notificationRepo.isFollowing(user.uid, userId);
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  };
  // Crear notificación para seguidores
  const notifyFollowers = async (type: NotificationMessage['type'], title: string, body: string, data?: Record<string, string | number | boolean>) => {
    if (!user) return;
    
    try {
      console.log('📡 Obteniendo seguidores para:', user.uid);
      const followers = await notificationRepo.getFollowers(user.uid);
      console.log('👥 Seguidores encontrados:', followers.length);
      
      if (followers.length === 0) {
        console.log('ℹ️ No hay seguidores para notificar');
        return;
      }
      
      // Crear notificaciones para todos los seguidores
      const notifications = followers.map(followerId => {
        console.log('📨 Creando notificación para:', followerId);
        return notificationRepo.createNotification({
          recipientId: followerId,
          senderId: user.uid,
          type,
          title,
          body,
          data
        });
      });
      
      await Promise.all(notifications);
      console.log('✅ Notificaciones creadas para', followers.length, 'seguidores');
    } catch (error) {
      console.error('Error notifying followers:', error);
    }
  };

  // Solicitar permisos para notificaciones
  const requestPermission = async (): Promise<boolean> => {
    if (!messaging) {
      console.error('Firebase messaging not initialized');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);
      
      if (permission === 'granted') {
        const fcmToken = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_VAPID_KEY
        });
        
        if (fcmToken) {
          setToken(fcmToken);
          
          // Si hay usuario, actualizar su perfil con el token
          if (user) {
            await notificationRepo.createOrUpdateNotificationProfile(user.uid, fcmToken);
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };
  // Configurar autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      
      // Si se autentica y ya tenemos token, actualizar perfil
      if (authUser && token) {
        notificationRepo.createOrUpdateNotificationProfile(authUser.uid, token);
      }
    });
    
    return unsubscribe;
  }, [token, notificationRepo]);
  // Configurar escucha de mensajes en tiempo real
  useEffect(() => {
    if (!messaging || !user) return;
    
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received:', payload);
      
      // Crear notificación del navegador si la app no está en foco
      if (document.hidden && payload.notification) {
        new Notification(payload.notification.title || 'Nueva notificación', {
          body: payload.notification.body || '',
          icon: '/favicon.ico',
          badge: '/favicon.ico'
        });
      }
      
      // Recargar notificaciones
      loadNotifications();
    });
    
    return unsubscribe;
  }, [user, loadNotifications]);
  // Cargar notificaciones al montar y cuando cambie el usuario
  useEffect(() => {
    if (user) {
      loadNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user, loadNotifications]);

  // Verificar permisos al montar
  useEffect(() => {
    setPermission(Notification.permission);
  }, []);

  return {
    // Estado
    notifications,
    unreadCount,
    loading,
    permission,
    token,
    
    // Acciones
    requestPermission,
    loadNotifications,
    markAsRead,
    followUser,
    unfollowUser,
    isFollowing,
    notifyFollowers
  };
}
