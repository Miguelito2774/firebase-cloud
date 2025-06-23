'use client';

import { useState, useEffect } from 'react';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useNotifications } from '../hooks/useNotifications';
import { auth } from '../lib/firebase';

interface FollowButtonProps {
  userId: string;
  userName?: string;
  className?: string;
}

export function FollowButton({ userId, userName, className }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const { followUser, unfollowUser, isFollowing: checkIsFollowing } = useNotifications();
  const currentUser = auth.currentUser;

  // Cargar estado inicial solo una vez
  useEffect(() => {
    const loadFollowStatus = async () => {
      if (!currentUser || currentUser.uid === userId || initialized) return;

      try {
        const followStatus = await checkIsFollowing(userId);
        setIsFollowing(followStatus);
        setInitialized(true);
      } catch (error) {
        console.error('Error checking follow status:', error);
        setInitialized(true);
      }
    };

    loadFollowStatus();
  }, [userId, currentUser, checkIsFollowing, initialized]);

  // No mostrar el botón si es el mismo usuario
  if (!currentUser || currentUser.uid === userId) {
    return null;
  }

  const handleFollowToggle = async () => {
    if (loading) return;

    try {
      setLoading(true);
      
      if (isFollowing) {
        const success = await unfollowUser(userId);
        if (success) {
          setIsFollowing(false);
          console.log(`✅ Dejaste de seguir a ${userName}`);
        }
      } else {
        const success = await followUser(userId);
        if (success) {
          setIsFollowing(true);
          console.log(`✅ Ahora sigues a ${userName}`);
        }
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!initialized) {
    return (
      <Button variant="outline" size="sm" disabled className={className}>
        <Loader2 className="h-4 w-4 animate-spin" />
      </Button>
    );
  }

  return (
    <Button
      variant={isFollowing ? "secondary" : "default"}
      size="sm"
      onClick={handleFollowToggle}
      disabled={loading}
      className={className}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
      ) : isFollowing ? (
        <UserMinus className="h-4 w-4 mr-2" />
      ) : (
        <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? 'Siguiendo' : 'Seguir'}
      {userName && ` ${userName.split('@')[0]}`}
    </Button>
  );
}
