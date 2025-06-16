'use client';

import { CreatePostForm } from './CreatePostForm';
import { PostList } from './PostList';
import { usePosts } from '../hooks/usePosts';
import type { User } from 'firebase/auth';

interface PostsComponentProps {
  user: User;
}

export function PostsComponent({ user }: PostsComponentProps) {
  const { posts, loading, error, createPost, deletePost } = usePosts(user);

  return (
    <div className="space-y-6">
      <CreatePostForm 
        onSubmit={createPost}
        loading={loading}
      />
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      
      <PostList
        posts={posts}
        onDeletePost={deletePost}
        loading={loading}
      />
    </div>
  );
}
