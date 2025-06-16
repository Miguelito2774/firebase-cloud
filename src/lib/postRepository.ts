import { 
  collection,
  doc, 
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import type { Post, CreatePostData } from '../types/post';

export class PostRepository {
  private collectionName = 'posts';

  async createPost(authorUID: string, authorEmail: string, postData: CreatePostData): Promise<Post> {
    const postsCollection = collection(db, this.collectionName);
    
    const postToCreate = {
      title: postData.title,
      content: postData.content,
      authorUID,
      authorEmail,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(postsCollection, postToCreate);

    return {
      id: docRef.id,
      title: postData.title,
      content: postData.content,
      authorUID,
      authorEmail,
      createdAt: new Date()
    };
  }

  async getUserPosts(authorUID: string): Promise<Post[]> {
    try {
      const postsCollection = collection(db, this.collectionName);
      const q = query(
        postsCollection, 
        where('authorUID', '==', authorUID),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const posts: Post[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        posts.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          authorUID: data.authorUID,
          authorEmail: data.authorEmail,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });

      return posts;
    } catch (error) {
      console.error('Error getting user posts:', error);
      return [];
    }
  }

  async deletePost(postId: string): Promise<void> {
    const postDoc = doc(db, this.collectionName, postId);
    await deleteDoc(postDoc);
  }

}
