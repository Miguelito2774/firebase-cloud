import { useState, useEffect } from 'react';
import { PostRepository } from '../lib/postRepository';
import { useNotifications } from './useNotifications';
import type { Post, CreatePostData } from '../types/post';
import type { User } from 'firebase/auth';

const postRepository = new PostRepository();

export const usePosts = (user: User | null) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { notifyFollowers } = useNotifications();

  // Cargar posts del usuario
  const loadUserPosts = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      const userPosts = await postRepository.getUserPosts(user.uid);
      setPosts(userPosts);
    } catch (err) {
      setError('Error al cargar los posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };
  // Crear nuevo post
  const createPost = async (postData: CreatePostData) => {
    if (!user?.uid || !user?.email) {
      setError('Usuario no autenticado');
      return false;
    }

    try {
      setLoading(true);
      setError(null);      const newPost = await postRepository.createPost(user.uid, user.email, postData);
      setPosts(prev => [newPost, ...prev]); 
      
      console.log('🔔 Enviando notificaciones para nuevo post:', newPost.id);
      await notifyFollowers(
        'new_post',
        `Nuevo post de ${user.email}`,
        `${postData.title}: ${postData.content.substring(0, 50)}${postData.content.length > 50 ? '...' : ''}`,
        { 
          postId: newPost.id!,
          authorName: user.email,
          postTitle: postData.title
        }
      );
      console.log('✅ Notificaciones enviadas para post:', newPost.id);
      
      return true;
    } catch (err) {
      setError('Error al crear el post');
      console.error('Error creating post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar post
  const deletePost = async (postId: string) => {
    try {
      setLoading(true);
      setError(null);
      await postRepository.deletePost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      return true;
    } catch (err) {
      setError('Error al eliminar el post');
      console.error('Error deleting post:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  // Cargar posts cuando cambie el usuario
  useEffect(() => {
    const loadPosts = async () => {
      if (!user?.uid) {
        setPosts([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userPosts = await postRepository.getUserPosts(user.uid);
        setPosts(userPosts);
      } catch (err) {
        setError('Error al cargar los posts');
        console.error('Error loading posts:', err);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [user?.uid]);

  return {
    posts,
    loading,
    error,
    createPost,
    deletePost,
    refreshPosts: loadUserPosts,
    reloadPosts: loadUserPosts
  };
};
