importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDCjlpdK4G6TphXaNZM9XwrCaUImirWKkA",
  authDomain: "mi-app-b0862.firebaseapp.com",
  projectId: "mi-app-b0862",
  storageBucket: "mi-app-b0862.firebasestorage.app",
  messagingSenderId: "566888773016",
  appId: "1:566888773016:web:112c9385de75b6e5bb27ed",
  measurementId: "G-Y31HXGLX2Z"
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
