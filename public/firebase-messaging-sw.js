importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDasXmizMjRngnv3SffawPG-3rKDNJa-xE",
  authDomain: "mickyfirebase.firebaseapp.com",
  projectId: "mickyfirebase",
  storageBucket: "mickyfirebase.firebasestorage.app",
  messagingSenderId: "346525836307",
  appId: "1:346525836307:web:f10d96a9036705d4d50be6",
  measurementId: "G-SSRBR5ZB94"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification?.title || 'Nueva notificación';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'notification',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  // Handle click action
  event.waitUntil(
    clients.openWindow('/')
  );
});
