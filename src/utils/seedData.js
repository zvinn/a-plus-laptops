import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { laptops } from "../data/laptops";

export const seedLaptops = async () => {
    const laptopsCollection = collection(db, "laptops");

    console.log("Starting data seeding...");

    try {
        for (const laptop of laptops) {
            // Using setDoc with laptop.id as document ID to ensure idempotency
            await setDoc(doc(laptopsCollection, laptop.id.toString()), laptop);
            console.log(`Uploaded: ${laptop.name}`);
        }
        console.log("Data seeding completed successfully!");
    } catch (error) {
        console.error("Error seeding data:", error);
    }
};
