'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Trash2 } from 'lucide-react';
import { FollowButton } from './FollowButton';
import { PostReactions } from './PostReactions';
import type { Post } from '../types/post';

interface PostListProps {
  posts: Post[];
  onDeletePost: (postId: string) => Promise<boolean>;
  onPostUpdate?: () => void;
  loading?: boolean;
}

export function PostList({ posts, onDeletePost, onPostUpdate, loading = false }: PostListProps) {
  const handleDelete = async (postId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este post?')) {
      await onDeletePost(postId);
    }
  };

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No tienes posts aún. ¡Crea tu primer post!
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Mis Posts ({posts.length})</h3>
      {posts.map((post) => (
        <Card key={post.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <CardTitle className="text-lg">{post.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => post.id && handleDelete(post.id)}
              disabled={loading}
              className="text-red-600 hover:text-red-800 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
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
            
            {/* Reacciones */}
            <div className="mt-4 mb-4">
              <PostReactions
                postId={post.id!}
                likes={post.likes || []}
                dislikes={post.dislikes || []}
                likesCount={post.likesCount || 0}
                dislikesCount={post.dislikesCount || 0}
                onReactionChange={onPostUpdate}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Creado el {post.createdAt.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
              <FollowButton 
                userId={post.authorUID} 
                userName={post.authorEmail}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
