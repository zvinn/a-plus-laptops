import { db } from '../firebase';
import { collection, getDocs, setDoc, deleteDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

const SUPER_ADMIN_EMAIL = 'mhamed.saad.ibrahim@gmail.com';

export const adminService = {
    // Check if user is admin
    checkAdminStatus: async (email) => {
        if (!email) return { isAdmin: false, isSuperAdmin: false };
        const lowerEmail = email.toLowerCase();

        // Check Super Admin
        if (lowerEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
            return { isAdmin: true, isSuperAdmin: true };
        }

        // Check Firestore
        try {
            const adminDoc = await getDoc(doc(db, 'admins', lowerEmail));
            return { isAdmin: adminDoc.exists(), isSuperAdmin: false };
        } catch (err) {
            console.error('Error checking admin status:', err);
            return { isAdmin: false, isSuperAdmin: false };
        }
    },

    // Get all admins
    getAdmins: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, 'admins'));
            return querySnapshot.docs.map(doc => ({
                email: doc.id,
                ...doc.data()
            }));
        } catch (err) {
            console.error('Error fetching admins:', err);
            throw err;
        }
    },

    // Add new admin
    addAdmin: async (email, addedBy) => {
        const emailToAdd = email.toLowerCase().trim();
        try {
            await setDoc(doc(db, 'admins', emailToAdd), {
                addedBy,
                addedAt: serverTimestamp()
            });
            return emailToAdd;
        } catch (err) {
            console.error('Error adding admin:', err);
            throw err;
        }
    },

    // Remove admin
    removeAdmin: async (email) => {
        if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
            throw new Error('Cannot remove Super Admin');
        }
        try {
            await deleteDoc(doc(db, 'admins', email));
        } catch (err) {
            console.error('Error removing admin:', err);
            throw err;
        }
    }
};
