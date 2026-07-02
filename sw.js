importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBczbrdQn9eWhQQg_phzaNGps5PKvPPar4",
  authDomain: "vlt-notification.firebaseapp.com",
  projectId: "vlt-notification",
  storageBucket: "vlt-notification.firebasestorage.app",
  messagingSenderId: "868115123925",
  appId: "1:868115123925:web:a738b460e7e139bc965c5c"
});

const messaging = firebase.messaging();

// แจ้งเตือนตอนแอปปิด/พับหน้าจอ (background) — จุดนี้คือส่วนที่ทำให้ realtime
// จริงแม้เบราว์เซอร์หยุดรัน JS ของหน้าเว็บไปแล้ว
messaging.onBackgroundMessage((payload) => {
  const data  = payload.data || {};
  const notif = payload.notification || {};
  const title = notif.title || data.title || 'Driver Portal';
  self.registration.showNotification(title, {
    body: notif.body || data.body || '',
    tag: data.tag || 'driver-portal-bg',
    requireInteraction: data.requireInteraction === 'true',
    vibrate: [300, 150, 300],
    data
  });
});

// แตะที่ notification แล้วเด้งกลับมาเปิด/โฟกัสแอป
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const c of list) if ('focus' in c) return c.focus();
      if (clients.openWindow) return clients.openWindow('./');
    })
  );
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
