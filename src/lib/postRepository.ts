import { 
  collection,
  doc, 
  addDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { StorageService } from './storageService';
import type { Post, CreatePostData } from '../types/post';

export class PostRepository {
  private collectionName = 'posts';
  private storageService = new StorageService();

  async createPost(authorUID: string, authorEmail: string, postData: CreatePostData): Promise<Post> {
    const postsCollection = collection(db, this.collectionName);
    
    let imageUrl: string | undefined;
      // Si hay imagen, subirla primero
    if (postData.image) {
      try {
        imageUrl = await this.storageService.uploadPostImage(authorUID, postData.image);
      } catch {
        throw new Error('Error al subir la imagen');
      }
    }
    
    const postToCreate = {
      title: postData.title,
      content: postData.content,
      authorUID,
      authorEmail,
      imageUrl,  
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(postsCollection, postToCreate);    return {
      id: docRef.id,
      title: postData.title,
      content: postData.content,
      authorUID,
      authorEmail,
      imageUrl,
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
        const data = doc.data();        posts.push({
          id: doc.id,
          title: data.title,
          content: data.content,
          authorUID: data.authorUID,
          authorEmail: data.authorEmail,
          imageUrl: data.imageUrl,
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
    try {
      // Obtener el post para conseguir la URL de la imagen
      const postDoc = doc(db, this.collectionName, postId);
      const postSnapshot = await getDoc(postDoc);
      
      if (postSnapshot.exists()) {
        const postData = postSnapshot.data();
        
        // Si el post tiene imagen, eliminarla de Storage
        if (postData.imageUrl) {
          await this.storageService.deletePostImage(postData.imageUrl);
        }
      }
      
      // Eliminar el documento de Firestore
      await deleteDoc(postDoc);
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

}
