```javascript
const CACHE_NAME = "daily-aura-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json"
];


/* ================================
   INSTALL
================================ */

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return cache.addAll(APP_FILES);

      })

  );

  self.skipWaiting();

});


/* ================================
   ACTIVATE
================================ */

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(

          keys.map(key => {

            if (key !== CACHE_NAME) {

              return caches.delete(key);

            }

          })

        );

      })

  );

  self.clients.claim();

});


/* ================================
   FETCH
================================ */

self.addEventListener("fetch", event => {

  if (
    event.request.method !== "GET"
  ) {
    return;
  }

  event.respondWith(

    caches.match(event.request)
      .then(cached => {

        if (cached) {
          return cached;
        }

        return fetch(event.request)
          .then(response => {

            const copy =
              response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {

                cache.put(
                  event.request,
                  copy
                );

              });

            return response;

          })
          .catch(() => {

            return caches.match(
              "./index.html"
            );

          });

      })

  );

});


/* ================================
   PUSH NOTIFICATION
================================ */

self.addEventListener(
  "push",
  event => {

    let data = {

      title: "Daily Aura ✨",

      body:
        "Your daily Horoscope, Tarot and Quote are ready.",

      icon: "./icon-192.png",

      badge: "./icon-192.png",

      url: "./"

    };


    if (event.data) {

      try {

        data =
          {
            ...data,
            ...event.data.json()
          };

      } catch (error) {

        data.body =
          event.data.text();

      }

    }


    event.waitUntil(

      self.registration
        .showNotification(
          data.title,
          {

            body: data.body,

            icon: data.icon,

            badge: data.badge,

            vibrate: [
              100,
              50,
              100
            ],

            data: {
              url: data.url
            }

          }
        )

    );

  }
);


/* ================================
   NOTIFICATION CLICK
================================ */

self.addEventListener(
  "notificationclick",
  event => {

    event.notification.close();


    const url =
      event.notification.data &&
      event.notification.data.url
        ? event.notification.data.url
        : "./";


    event.waitUntil(

      clients.matchAll({
        type: "window",
        includeUncontrolled: true
      })
      .then(windowClients => {

        for (
          const client
          of windowClients
        ) {

          if (
            "focus" in client
          ) {

            client.focus();

            return client.navigate(
              url
            );

          }

        }


        if (
          clients.openWindow
        ) {

          return clients.openWindow(
            url
          );

        }

      })

    );

  }
);
```
