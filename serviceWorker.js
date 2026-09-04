/* serviceWorker.js */
// (参考) https://developer.mozilla.org/ja/docs/Web/Progressive_web_apps/Offline_Service_workers
'use strict';

const cacheName = 'bgScoreAppSvg-v20260904';
const ORIGIN = (location.hostname == 'localhost') ? '' : location.protocol + '//' + location.hostname;

const contentToCache = [
  ORIGIN + '/bgScoreAppSvg/',
  ORIGIN + '/bgScoreAppSvg/index.html',
  ORIGIN + '/bgScoreAppSvg/manifest.json',
  ORIGIN + '/bgScoreAppSvg/icon/favicon.ico',
  ORIGIN + '/bgScoreAppSvg/icon/apple-touch-icon.png',
  ORIGIN + '/bgScoreAppSvg/icon/android-chrome-96x96.png',
  ORIGIN + '/bgScoreAppSvg/icon/android-chrome-192x192.png',
  ORIGIN + '/bgScoreAppSvg/icon/android-chrome-512x512.png',
  ORIGIN + '/bgScoreAppSvg/css/bgScoreApp.css',
  ORIGIN + '/bgScoreAppSvg/js/bgScoreAppSvg_class.js',
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
        return caches.open(cacheName).then((cache) => {
          if (e.request.url.startsWith('http')) { //ignore chrome-extention: request (refuse error msg)
            cache.put(e.request, response.clone());
          }
          return response;
        });
      });
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
