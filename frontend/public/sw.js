// File ini membuat Jangkrik.OS sah diakui sebagai aplikasi PWA
self.addEventListener("install", (e) => {
  self.skipWaiting();
  console.log("[Jangkrik.OS] Service Worker Terinstal");
});

self.addEventListener("fetch", (e) => {
  // Biarkan fetch berjalan normal secara online
  e.respondWith(
    fetch(e.request).catch(() => {
      return new Response(
        "Kamu sedang offline. Pastikan koneksi internet nyala ya, Bos!",
      );
    }),
  );
});
