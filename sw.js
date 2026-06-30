/* sw.js — Service Worker สำหรับ Driver Portal
   ทำหน้าที่รับ FCM push notification ตอนแอปอยู่เบื้องหลัง/ปิดอยู่
   (ต่างจากเดิมที่ใช้ local Notification API ซึ่งใช้ไม่ได้เมื่อแท็บถูกปิด/หยุดทำงาน) */

/* ───────────────────────────────────────────────
   Firebase Messaging (compat SDK — ใช้ใน service worker ได้)
   ต้องใช้เวอร์ชัน "compat" เพราะ ES module import ใน SW
   ยังรองรับไม่เต็มที่ในทุกเบราว์เซอร์
─────────────────────────────────────────────── */
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js');

/* ค่าเดียวกับใน index.html — ใส่ตรงนี้เพราะ service worker
   โหลดแยกไฟล์ ไม่ได้แชร์ scope กับหน้าเว็บหลัก */
firebase.initializeApp({
  apiKey: "AIzaSyBczbrdQn9eWhQQg_phzaNGps5PKvPPar4",
  authDomain: "vlt-notification.firebaseapp.com",
  projectId: "vlt-notification",
  storageBucket: "vlt-notification.firebasestorage.app",
  messagingSenderId: "868115123925",
  appId: "1:868115123925:web:a738b460e7e139bc965c5c"
});

const messaging = firebase.messaging();

/* ── ติดตั้ง / เปิดใช้งานทันที ── */
self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

/* ───────────────────────────────────────────────
   รับ push ตอนแอปอยู่เบื้องหลัง (background)
   FCM จะเรียก handler นี้อัตโนมัติเมื่อ message มี "notification" payload
   (ถ้า backend ส่งแบบ "data-only" จะต้องเขียน push event handler เอง
    ไว้ปรับเมื่อฝั่ง backend พร้อมแล้ว)
─────────────────────────────────────────────── */
messaging.onBackgroundMessage((payload) => {
  console.log('[sw.js] ได้รับ background message:', payload);

  const data = payload.data || {};
  const notif = payload.notification || {};

  const title = notif.title || data.title || 'Driver Portal';
  const options = {
    body: notif.body || data.body || '',
    icon: notif.icon || data.icon || './icon-192.png',
    badge: data.badge || './icon-192.png',
    tag: data.tag || 'driver-portal-fcm',
    requireInteraction: data.requireInteraction === 'true' || data.requireInteraction === true,
    vibrate: [300, 150, 300],
    data: data // เก็บไว้ใช้ตอนกดที่ notification (เช่น tripId, deep link)
  };

  self.registration.showNotification(title, options);
});

/* เมื่อผู้ใช้แตะที่ notification ให้โฟกัสกลับมาที่แท็บ/เปิดแท็บใหม่ */
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./index.html');
      }
    })
  );
});
