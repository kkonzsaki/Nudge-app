/* ============================================================
   Nudge — Firebase Cloud Messaging Service Worker
   Handles push notifications when app is closed/background
   ============================================================ */
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCIP-VfSEgN_6QTQB5tt1sR9B66HXiMTVE",
  authDomain: "nudge-c931b.firebaseapp.com",
  projectId: "nudge-c931b",
  storageBucket: "nudge-c931b.firebasestorage.app",
  messagingSenderId: "686955454136",
  appId: "1:686955454136:web:92138925c4ca1519eb5e4d"
});

const messaging = firebase.messaging();

/* Handle background messages */
messaging.onBackgroundMessage(payload => {
  console.log('Nudge background message:', payload);
  const { title, body, icon } = payload.notification || {};
  self.registration.showNotification(title || 'Nudge', {
    body: body || 'Time to check your budget',
    icon: icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'nudge-reminder',
    renotify: true,
    data: payload.data || {},
    actions: [
      { action: 'open', title: 'Open Nudge' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
});

/* Handle notification click */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  if (e.action === 'dismiss') return;
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => {
        for (const client of list) {
          if (client.url.includes('netlify.app') || client.url.includes('nudge')) {
            return client.focus();
          }
        }
        return clients.openWindow('https://legendary-phoenix-795ec2.netlify.app');
      })
  );
});
