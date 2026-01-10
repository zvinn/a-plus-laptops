/* eslint-disable no-undef */
// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
    apiKey: "AIzaSyAvmw0np9FvYFWfh3d5PJfy6hV8e80hbU0",
    authDomain: "a-plus-laptops.firebaseapp.com",
    projectId: "a-plus-laptops",
    storageBucket: "a-plus-laptops.firebasestorage.app",
    messagingSenderId: "674755990794",
    appId: "1:674755990794:web:6879b21efce3fb6a2ad6f3",
    measurementId: "G-KLSTCQQ96Y"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here if needed
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/pwa-192x192.png' // Ensure this path is correct
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
