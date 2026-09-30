/* serviceWorker.js */
// (参考) https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Offline_Service_workers
'use strict';

const cacheName = 'bgScoreAppSvg-v20260930b';
const ORIGIN = location.origin; //ポート番号を含むorigin(LAN内IP:ポートなどでも動作させる)

const contentToCache = [
  ORIGIN + '/bgScoreAppSvg/',
  ORIGIN + '/bgScoreAppSvg/index.html',
  ORIGIN + '/bgScoreAppSvg/7segment.html',
  ORIGIN + '/bgScoreAppSvg/rectangle.html',
  ORIGIN + '/bgScoreAppSvg/dotmatrix.html',
  ORIGIN + '/bgScoreAppSvg/flipfont.html',
  ORIGIN + '/bgScoreAppSvg/odometer.html',
  ORIGIN + '/bgScoreAppSvg/handwrite.html',
  ORIGIN + '/bgScoreAppSvg/css/bgScoreApp.css',
  ORIGIN + '/bgScoreAppSvg/js/bgScoreAppSvg_class.js',
  ORIGIN + '/bgScoreAppSvg/js/SevenSegment_class.js',
  ORIGIN + '/bgScoreAppSvg/js/RectanglePolygon_class.js',
  ORIGIN + '/bgScoreAppSvg/js/DotMatrix_class.js',
  ORIGIN + '/bgScoreAppSvg/js/FlipFont_class.js',
  ORIGIN + '/bgScoreAppSvg/js/Odometer_class.js',
  ORIGIN + '/bgScoreAppSvg/js/HandWrite_class.js',
  ORIGIN + '/bgScoreAppSvg/manifest-7seg.json',
  ORIGIN + '/bgScoreAppSvg/manifest-rect.json',
  ORIGIN + '/bgScoreAppSvg/manifest-dot.json',
  ORIGIN + '/bgScoreAppSvg/manifest-flip.json',
  ORIGIN + '/bgScoreAppSvg/manifest-odo.json',
  ORIGIN + '/bgScoreAppSvg/manifest-hand.json',
  ORIGIN + '/bgScoreAppSvg/icon/7seg/favicon.ico',
  ORIGIN + '/bgScoreAppSvg/icon/7seg/apple-touch-icon.png',
  ORIGIN + '/bgScoreAppSvg/icon/7seg/android-chrome-96x96.png',
  ORIGIN + '/bgScoreAppSvg/icon/7seg/android-chrome-192x192.png',
  ORIGIN + '/bgScoreAppSvg/icon/7seg/android-chrome-512x512.png',
  ORIGIN + '/bgScoreAppSvg/icon/rect/favicon.ico',
  ORIGIN + '/bgScoreAppSvg/icon/rect/apple-touch-icon.png',
  ORIGIN + '/bgScoreAppSvg/icon/rect/android-chrome-96x96.png',
  ORIGIN + '/bgScoreAppSvg/icon/rect/android-chrome-192x192.png',
  ORIGIN + '/bgScoreAppSvg/icon/rect/android-chrome-512x512.png',
  ORIGIN + '/bgScoreAppSvg/icon/dot/favicon.ico',
  ORIGIN + '/bgScoreAppSvg/icon/dot/apple-touch-icon.png',
  ORIGIN + '/bgScoreAppSvg/icon/dot/android-chrome-96x96.png',
  ORIGIN + '/bgScoreAppSvg/icon/dot/android-chrome-192x192.png',
  ORIGIN + '/bgScoreAppSvg/icon/dot/android-chrome-512x512.png',
  ORIGIN + '/bgScoreAppSvg/icon/flip/favicon.ico',
  ORIGIN + '/bgScoreAppSvg/icon/flip/apple-touch-icon.png',
  ORIGIN + '/bgScoreAppSvg/icon/flip/android-chrome-96x96.png',
  ORIGIN + '/bgScoreAppSvg/icon/flip/android-chrome-192x192.png',
  ORIGIN + '/bgScoreAppSvg/icon/flip/android-chrome-512x512.png',
  ORIGIN + '/bgScoreAppSvg/icon/odo/favicon.ico',
  ORIGIN + '/bgScoreAppSvg/icon/odo/apple-touch-icon.png',
  ORIGIN + '/bgScoreAppSvg/icon/odo/android-chrome-96x96.png',
  ORIGIN + '/bgScoreAppSvg/icon/odo/android-chrome-192x192.png',
  ORIGIN + '/bgScoreAppSvg/icon/odo/android-chrome-512x512.png',
  ORIGIN + '/bgScoreAppSvg/icon/hand/favicon.ico',
  ORIGIN + '/bgScoreAppSvg/icon/hand/apple-touch-icon.png',
  ORIGIN + '/bgScoreAppSvg/icon/hand/android-chrome-96x96.png',
  ORIGIN + '/bgScoreAppSvg/icon/hand/android-chrome-192x192.png',
  ORIGIN + '/bgScoreAppSvg/icon/hand/android-chrome-512x512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(cacheName).then((cache) => {
      return cache.addAll(contentToCache);
    })
  );
  self.skipWaiting();
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((r) => {
      return r || fetch(e.request).then((response) => {
        //正常応答(200番台)かつhttp(s)のGETだけキャッシュする
        //(404/500のキャッシュ固定化や、chrome-extension: 等のエラーを防ぐ)
        if (response.ok && e.request.method === 'GET' && e.request.url.startsWith('http')) {
          const copy = response.clone();
          caches.open(cacheName).then((cache) => cache.put(e.request, copy));
        }
        return response;
      }).catch(() => Response.error()); //オフラインで未キャッシュの場合は通常のネットワークエラーとして扱う
    })
  );
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        const [kyappname, kyversion] = key.split('-');
        const [cnappname, cnversion] = cacheName.split('-');
        if (kyappname === cnappname && kyversion !== cnversion) {
          return caches.delete(key);
        }
      }));
    })
  );
});
