import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const productService = {
    // Get all products
    getProducts: async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "laptops"));
            // Prioritize doc.id (Firestore Key) over any 'id' field in data
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        } catch (err) {
            console.error('Error fetching products:', err);
            throw err;
        }
    },

    // Add new product
    addProduct: async (productData) => {
        try {
            const productToAdd = {
                ...productData,
                price: Number(productData.price),
                // We keep legacy ID in data if needed by other systems, but we won't rely on it for operations
                internalId: Date.now().toString(),
                games: [],
                createdAt: serverTimestamp()
            };
            const docRef = await addDoc(collection(db, "laptops"), productToAdd);
            // Return Firestore ID as the main 'id'
            return { ...productToAdd, id: docRef.id };
        } catch (err) {
            console.error('Error adding product:', err);
            throw err;
        }
    },

    // Delete product
    deleteProduct: async (id) => {
        try {
            await deleteDoc(doc(db, "laptops", id));
        } catch (err) {
            console.error('Error deleting product:', err);
            throw err;
        }
    },

    // Update product (placeholder for future use)
    updateProduct: async (id, data) => {
        try {
            await updateDoc(doc(db, "laptops", id), data);
        } catch (err) {
            console.error('Error updating product:', err);
            throw err;
        }
    }
};
