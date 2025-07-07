import { onDocumentUpdated, onDocumentCreated } from "firebase-functions/v2/firestore";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

initializeApp();

// Trigger que se ejecuta cuando se actualiza un post (likes/dislikes)
export const postReactionTrigger = onDocumentUpdated(
  { document: "posts/{postId}", database: "m1234" },
  async (event) => {
    const postId = event.params.postId;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!beforeData || !afterData) return;

    // Verificar si hubo cambios en likes o dislikes
    const beforeLikes = beforeData.likes || [];
    const afterLikes = afterData.likes || [];
    const beforeDislikes = beforeData.dislikes || [];
    const afterDislikes = afterData.dislikes || [];

    // Detectar nuevos likes
    const newLikes = afterLikes.filter((userId: string) => 
      !beforeLikes.includes(userId)
    );

    // Detectar nuevos dislikes
    const newDislikes = afterDislikes.filter((userId: string) => 
      !beforeDislikes.includes(userId)
    );

    // Si hay nuevos likes o dislikes, crear notificación
    if (newLikes.length > 0 || newDislikes.length > 0) {
      const postAuthorUID = afterData.authorUID;
      
      // Evitar notificar al autor si reacciona a su propio post
      const usersToNotify = [
        ...newLikes.filter((userId: string) => userId !== postAuthorUID),
        ...newDislikes.filter((userId: string) => userId !== postAuthorUID)
      ];

      if (usersToNotify.length > 0 && postAuthorUID) {
        try {
          const db = getFirestore("m1234");
          const auth = getAuth();
          const notificationsRef = db.collection("notification_messages");
          
          for (const userId of usersToNotify) {
            const reactionType = newLikes.includes(userId) ? "like" : "dislike";
            
            // Obtener información del usuario que reaccionó
            const userRecord = await auth.getUser(userId);
            const userEmail = userRecord.email || "Usuario anónimo";
            
            await notificationsRef.add({
              recipientId: postAuthorUID, // Usuario que recibe la notificación (autor del post)
              senderId: userId, // Usuario que dio la reacción
              type: reactionType, // "like" o "dislike"
              title: `Reacción a tu post`,
              body: `${userEmail} ${reactionType === "like" ? "le gustó" : "no le gustó"} tu post: "${afterData.title}"`,
              data: {
                postId: postId,
                reactorUserId: userId,
                reactorEmail: userEmail,
                reactionType: reactionType,
                postTitle: afterData.title
              },
              read: false,
              createdAt: new Date()
            });

            console.log(`Notificación de ${reactionType} creada para el autor del post ${postId}`);
          }
        } catch (error) {
          console.error("Error creating reaction notification:", error);
        }
      }
    }
  }
);

// Trigger para moderar contenido automáticamente cuando se crea un post
export const postModerationTrigger = onDocumentCreated(
  { document: "posts/{postId}", database: "m1234" },
  async (event) => {
    const postData = event.data?.data();
    const postId = event.params.postId;

    if (!postData) return;

    try {
      const prohibitedWords = [
        "mierda", "mrd", "ctm", "hp", "hijodeputa", "puta", "coño", "joder",
        "cabron", "cabrón", "imbecil", "imbécil", "idiota", "estupido", "estúpido",
        "pendejo", "culero", "mamada", "verga", "pinche", "chingada", "chingar",
        "puto", "marica", "maricón"
      ];

      let moderatedTitle = postData.title;
      let moderatedContent = postData.content;
      let contentWasModerated = false;

      // Moderar título
      for (const word of prohibitedWords) {
        const regex = new RegExp(word, "gi");
        if (regex.test(moderatedTitle)) {
          moderatedTitle = moderatedTitle.replace(regex, "[redacted]");
          contentWasModerated = true;
        }
      }

      // Moderar contenido
      for (const word of prohibitedWords) {
        const regex = new RegExp(word, "gi");
        if (regex.test(moderatedContent)) {
          moderatedContent = moderatedContent.replace(regex, "[redacted]");
          contentWasModerated = true;
        }
      }

      // Si se moderó contenido, actualizar el post
      if (contentWasModerated) {
        const db = getFirestore("m1234");
        await db.collection("posts").doc(postId).update({
          title: moderatedTitle,
          content: moderatedContent,
          moderatedAt: new Date()
        });

        console.log(`Post ${postId} fue moderado automáticamente`);

        // Opcional: Crear notificación para el autor
        const notificationsRef = db.collection("notification_messages");
        await notificationsRef.add({
          recipientId: postData.authorUID,
          senderId: "system",
          type: "content_moderated",
          title: "Contenido moderado",
          body: "Tu post ha sido moderado automáticamente debido a contenido inapropiado.",
          data: {
            postId: postId,
            postTitle: postData.title
          },
          read: false,
          createdAt: new Date()
        });
      }
    } catch (error) {
      console.error("Error moderating post content:", error);
    }
  }
);
