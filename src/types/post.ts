export interface Post {
  id?: string;
  title: string;
  content: string;
  authorUID: string;
  authorEmail?: string;
  imageUrl?: string;  
  createdAt: Date;
  likes?: string[]; 
  dislikes?: string[]; 
  likesCount?: number;
  dislikesCount?: number;
}

export interface CreatePostData {
  title: string;
  content: string;
  image?: File;  
}

export interface PostReaction {
  postId: string;
  userId: string;
  type: 'like' | 'dislike';
}
