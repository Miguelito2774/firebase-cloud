'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { auth } from '../lib/firebase';
import { PostRepository } from '../lib/postRepository';
import { onAuthStateChanged, User } from 'firebase/auth';

interface PostReactionsProps {
  postId: string;
  likes: string[];
  dislikes: string[];
  likesCount: number;
  dislikesCount: number;
  onReactionChange?: () => void;
}

export function PostReactions({ 
  postId, 
  likes, 
  dislikes, 
  likesCount, 
  dislikesCount,
  onReactionChange 
}: PostReactionsProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const postRepository = new PostRepository();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  const currentUserId = user?.uid;
  const hasLiked = currentUserId ? likes.includes(currentUserId) : false;
  const hasDisliked = currentUserId ? dislikes.includes(currentUserId) : false;

  const handleLike = async () => {
    if (!currentUserId || loading) return;
    
    setLoading(true);
    try {
      await postRepository.toggleLike(postId, currentUserId);
      onReactionChange?.();
    } catch (error) {
      console.error('Error al dar like:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId || loading) return;
    
    setLoading(true);
    try {
      await postRepository.toggleDislike(postId, currentUserId);
      onReactionChange?.();
    } catch (error) {
      console.error('Error al dar dislike:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-4 text-gray-500">
        <div className="flex items-center space-x-1">
          <ThumbsUp className="h-4 w-4" />
          <span>{likesCount}</span>
        </div>
        <div className="flex items-center space-x-1">
          <ThumbsDown className="h-4 w-4" />
          <span>{dislikesCount}</span>
        </div>
        <span className="text-xs">Inicia sesión para reaccionar</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={hasLiked ? "default" : "outline"}
        size="sm"
        onClick={handleLike}
        disabled={loading}
        className={`flex items-center space-x-1 ${
          hasLiked 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'hover:bg-green-50 hover:text-green-600'
        }`}
      >
        <ThumbsUp className="h-4 w-4" />
        <span>{likesCount}</span>
      </Button>
      
      <Button
        variant={hasDisliked ? "default" : "outline"}
        size="sm"
        onClick={handleDislike}
        disabled={loading}
        className={`flex items-center space-x-1 ${
          hasDisliked 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'hover:bg-red-50 hover:text-red-600'
        }`}
      >
        <ThumbsDown className="h-4 w-4" />
        <span>{dislikesCount}</span>
      </Button>
    </div>
  );
}
