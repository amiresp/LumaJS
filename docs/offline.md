# Offline assets (opt-in)

Import `registerOffline` from `js/shared/offline/registerOffline.js` explicitly. On HTTPS, a service worker caches previously visited same-origin public static GET assets, falling back on network errors. It refuses API, navigation, authorization, cross-origin and private/no-store responses. The runtime never requires Service Worker or Node. Increment the SW cache version for releases. First offline visit and private data are not supported. Do not treat static offline caching as complete offline application support.
