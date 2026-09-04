import { db } from '../firebase';
import {
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc,
    query, orderBy, serverTimestamp, increment
} from 'firebase/firestore';

/**
 * Inventory Service Layer
 * Abstracts direct Firestore calls for better testability and maintenance
 */

export const inventoryService = {
    // Products
    async getProducts() {
        const snapshot = await getDocs(collection(db, 'laptops'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Movements
    async getMovements() {
        const q = query(collection(db, 'inventory_movements'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate?.() || new Date()
        }));
    },

    async addMovement(movement, userEmail) {
        const { productId, quantity, type, isIncoming, reason, notes } = movement;

        // 1. Add movement record
        await addDoc(collection(db, 'inventory_movements'), {
            productId,
            type,
            quantity,
            direction: isIncoming ? 'in' : 'out',
            reason: reason || '',
            notes: notes || '',
            addedBy: userEmail,
            createdAt: serverTimestamp()
        });

        // 2. Update product stock
        const productRef = doc(db, 'laptops', productId);
        const stockChange = isIncoming ? quantity : -quantity;
        await updateDoc(productRef, {
            stockCount: increment(stockChange)
        });
    },

    async adjustStock(productId, adjustment, userEmail) {
        // 1. Update product
        const productRef = doc(db, 'laptops', productId);
        await updateDoc(productRef, {
            stockCount: increment(adjustment)
        });

        // 2. Log movement
        await addDoc(collection(db, 'inventory_movements'), {
            productId,
            type: 'adjustment',
            quantity: Math.abs(adjustment),
            direction: adjustment > 0 ? 'in' : 'out',
            reason: 'Turn Fast Adjustment',
            addedBy: userEmail,
            createdAt: serverTimestamp()
        });
    },

    // Suppliers
    async getSuppliers() {
        const snapshot = await getDocs(collection(db, 'suppliers'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async addSupplier(supplier, userEmail) {
        return addDoc(collection(db, 'suppliers'), {
            ...supplier,
            addedBy: userEmail,
            createdAt: serverTimestamp()
        });
    },

    async deleteSupplier(supplierId) {
        return deleteDoc(doc(db, 'suppliers', supplierId));
    }
};
