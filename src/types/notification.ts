export interface NotificationProfile {
  uid: string;
  notificationTokens: string[];
  followedUsers: string[];
  isNotificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationSubscription {
  followerId: string;
  followedId: string;
  createdAt: Date;
}

export interface NotificationMessage {
  id?: string;
  recipientId: string;
  senderId: string;
  type: 'new_post' | 'new_follower' | 'like' | 'dislike' | 'comment' | 'content_moderated';
  title: string;
  body: string;
  data?: Record<string, string | number | boolean>;
  read: boolean;
  createdAt: Date;
}

export interface CreateNotificationData {
  recipientId: string;
  senderId: string;
  type: NotificationMessage['type'];
  title: string;
  body: string;
  data?: Record<string, string | number | boolean>;
}
