'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FollowButton } from './FollowButton';
import type { Post } from '../types/post';

interface PublicFeedProps {
  className?: string;
}

export function PublicFeed({ className }: PublicFeedProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPublicPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const postsQuery = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        const snapshot = await getDocs(postsQuery);
        const publicPosts: Post[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          publicPosts.push({
            id: doc.id,
            title: data.title,
            content: data.content,
            authorUID: data.authorUID,
            authorEmail: data.authorEmail,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt?.toDate() || new Date()
          });
        });
        
        setPosts(publicPosts);
      } catch (err) {
        console.error('Error loading public posts:', err);
        setError('Error al cargar los posts');
      } finally {
        setLoading(false);
      }
    };

    loadPublicPosts();
  }, []);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8">
          <div className="text-lg">Cargando posts...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-8 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <Card>
          <CardContent className="p-6 text-center text-gray-500">
            No hay posts públicos aún.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Feed Público ({posts.length})</h3>
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div className="flex-1">
              <CardTitle className="text-lg">{post.title}</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Por {post.authorEmail}</p>
            </div>
            <FollowButton 
              userId={post.authorUID} 
              userName={post.authorEmail}
              className="ml-2"
            />
          </CardHeader>
          <CardContent>
            {post.imageUrl && (
              <div className="mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-64 object-cover rounded-lg border"
                />
              </div>
            )}
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
            <div className="mt-4 text-sm text-gray-500">
              {post.createdAt.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
