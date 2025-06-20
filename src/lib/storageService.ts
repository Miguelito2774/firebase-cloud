import { CLOUDINARY_UPLOAD_URL, CLOUDINARY_UPLOAD_PRESET } from './cloudinaryConfig';

export class StorageService {
  // Subir imagen de post a Cloudinary
  async uploadPostImage(userId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', `posts/${userId}`); // Organizar por usuario
      
      const response = await fetch(CLOUDINARY_UPLOAD_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta de Cloudinary');
      }

      const data = await response.json();
      return data.secure_url; // URL segura de la imagen
    } catch (error) {
      console.error('Error uploading post image:', error);
      throw new Error('Error al subir la imagen');
    }
  }

  // Eliminar imagen de post de Cloudinary
  async deletePostImage(imageUrl: string): Promise<void> {
    try {
      // Extraer public_id de la URL de Cloudinary
      const publicId = this.extractPublicIdFromUrl(imageUrl);
      
      console.warn('Eliminar imagen de Cloudinary requiere backend. Public ID:', publicId);
      
    } catch (error) {
      console.error('Error deleting post image:', error);
    }
  }

  // Extraer public_id de URL de Cloudinary
  private extractPublicIdFromUrl(url: string): string {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.findIndex(part => part === 'upload');
      const publicIdWithExtension = parts.slice(uploadIndex + 2).join('/');
      return publicIdWithExtension.replace(/\.[^/.]+$/, ''); 
    } catch {
      return '';
    }
  }

  // Validar que el archivo sea una imagen
  validateImageFile(file: File): { isValid: boolean; error?: string } {
    // Verificar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return { isValid: false, error: 'El archivo debe ser una imagen' };
    }

    // Verificar tamaño (máximo 10MB - Cloudinary free permite hasta 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { isValid: false, error: 'La imagen debe ser menor a 10MB' };
    }

    // Tipos permitidos
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Formato no permitido. Usa JPG, PNG, WebP o GIF' };
    }

    return { isValid: true };
  }
}
