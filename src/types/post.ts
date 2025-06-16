export interface Post {
  id?: string;
  title: string;
  content: string;
  authorUID: string;
  authorEmail?: string;
  createdAt: Date;
}

export interface CreatePostData {
  title: string;
  content: string;
}
