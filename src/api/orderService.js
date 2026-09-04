import { db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy, getDoc } from 'firebase/firestore';

export const orderService = {
    // Get all orders
    getOrders: async () => {
        try {
            const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (err) {
            console.error('Error fetching orders:', err);
            throw err;
        }
    },

    // Update order status
    updateOrderStatus: async (orderId, newStatus) => {
        try {
            const orderRef = doc(db, "orders", orderId);
            await updateDoc(orderRef, { status: newStatus });
            return { id: orderId, status: newStatus };
        } catch (err) {
            console.error('Error updating order status:', err);
            throw err;
        }
    },

    // Get single order (if needed later)
    getOrderById: async (orderId) => {
        try {
            const orderDoc = await getDoc(doc(db, "orders", orderId));
            if (orderDoc.exists()) {
                return { id: orderDoc.id, ...orderDoc.data() };
            }
            return null;
        } catch (err) {
            console.error('Error fetching order:', err);
            throw err;
        }
    },

    // getUser for notifications (internal helper)
    getUserById: async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
                return userDoc.data();
            }
            return null;
        } catch (err) {
            console.error('Error fetching user:', err);
            throw err;
        }
    }
};
