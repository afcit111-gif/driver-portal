/* sw.js — Service Worker สำหรับ Driver Portal
   ทำหน้าที่แสดง "system notification" (ขึ้นบน notification tray ของมือถือ)
   แม้ผู้ใช้จะสลับแอป/ปิดหน้าจออยู่ ตราบใดที่เบราว์เซอร์ยังทำงานอยู่เบื้องหลัง */

self.addEventListener('install', (e) => {
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
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
