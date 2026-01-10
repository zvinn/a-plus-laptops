import admin from 'firebase-admin';

// Initialize Firebase Admin (Server Side)
// We check if apps length is 0 to avoid re-initializing in hot-reload environments
if (!admin.apps.length) {
    try {
        // Environment variables should be set in Vercel project settings
        // For local development, you need a .env file or hardcoded (not recommended for git)
        // We expect FIREBASE_SERVICE_ACCOUNT_KEY (JSON string) or individual fields.

        // Robust way: Parse the JSON string from env var
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}');

        // Check if we have credentials
        if (Object.keys(serviceAccount).length > 0) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            console.error("Missing FIREBASE_SERVICE_ACCOUNT_KEY env var");
        }

    } catch (error) {
        console.error("Firebase Admin Init Error:", error);
    }
}

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { token, title, body, icon, link } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Missing FCM token' });
    }

    if (!admin.apps.length) {
        return res.status(500).json({ message: 'Server misconfigured: Firebase Admin not initialized' });
    }

    try {
        const message = {
            notification: {
                title: title || 'New Notification',
                body: body || 'You have a new update.',
            },
            webpush: {
                headers: {
                    Urgency: 'high'
                },
                notification: {
                    icon: icon || '/pwa-192x192.png',
                    click_action: link || '/'
                }
            },
            token: token
        };

        const response = await admin.messaging().send(message);
        return res.status(200).json({ success: true, messageId: response });

    } catch (error) {
        console.error("FCM Send Error:", error);
        return res.status(500).json({ success: false, error: error.message });
    }
}
