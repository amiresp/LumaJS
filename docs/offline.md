# Offline assets (opt-in)

Import `registerOffline` from `js/shared/offline/registerOffline.js` explicitly. On HTTPS, a service worker caches previously visited same-origin public static GET assets, falling back on network errors. It refuses API, navigation, authorization, cross-origin and private/no-store responses. The runtime never requires Service Worker or Node. Increment the SW cache version for releases. First offline visit and private data are not supported. Do not treat static offline caching as complete offline application support.


## Offline navigation fallback

`offline.html` contains a minimal retry UI, shipped at the application root. When the optional Service Worker is installed online, it attempts to precache this document in its versioned cache. For a failed same-origin **navigation**, it serves that previously cached fallback if available. Network requests still take precedence. Authenticated API responses and personalized documents are not cached. If the precache fails or the Service Worker is not yet installed, a normal browser offline error may occur.
