// Sample laptop data for testing A Plus+ website
// Copy this data to Firebase Firestore collection "laptops"

const sampleLaptops = [
    {
        name: "ASUS ROG Strix G15",
        brand: "ASUS",
        price: 45000,
        oldPrice: 52000,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500",
        category: "Gaming",
        processor: "AMD Ryzen 9 5900HX",
        ram: "16GB DDR4",
        storage: "1TB SSD",
        gpu: "RTX 3070",
        screen: "15.6\" FHD 300Hz",
        useCase: "gaming",
        rating: 4.8,
        reviewCount: 156,
        soldCount: 89,
        stock: "in-stock",
        description: "لابتوب جيمنج قوي يتميز بمعالج AMD Ryzen 9 وكارت شاشة RTX 3070 للألعاب بأعلى جودة",
        featured: true,
        createdAt: new Date()
    },
    {
        name: "Lenovo Legion 5 Pro",
        brand: "Lenovo",
        price: 38000,
        oldPrice: 44000,
        image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500",
        category: "Gaming",
        processor: "Intel Core i7-12700H",
        ram: "16GB DDR5",
        storage: "512GB SSD",
        gpu: "RTX 3060",
        screen: "16\" QHD 165Hz",
        useCase: "gaming",
        rating: 4.7,
        reviewCount: 203,
        soldCount: 124,
        stock: "in-stock",
        description: "لابتوب Legion 5 Pro مع شاشة QHD ومعالج Intel الجيل الثاني عشر للجيمرز",
        featured: true,
        createdAt: new Date()
    },
    {
        name: "MSI Katana GF66",
        brand: "MSI",
        price: 32000,
        oldPrice: 36000,
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=500",
        category: "Gaming",
        processor: "Intel Core i5-11400H",
        ram: "16GB DDR4",
        storage: "512GB SSD",
        gpu: "RTX 3050",
        screen: "15.6\" FHD 144Hz",
        useCase: "gaming",
        rating: 4.5,
        reviewCount: 98,
        soldCount: 67,
        stock: "in-stock",
        description: "لابتوب MSI Katana مناسب للجيمنج بسعر تنافسي وأداء ممتاز",
        featured: true,
        createdAt: new Date()
    },
    {
        name: "HP Victus 16",
        brand: "HP",
        price: 35000,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
        category: "Gaming",
        processor: "AMD Ryzen 7 5800H",
        ram: "16GB DDR4",
        storage: "512GB SSD",
        gpu: "RTX 3060",
        screen: "16.1\" FHD 144Hz",
        useCase: "gaming",
        rating: 4.6,
        reviewCount: 145,
        soldCount: 92,
        stock: "in-stock",
        description: "HP Victus 16 لابتوب جيمنج بشاشة 16 بوصة وأداء قوي",
        featured: true,
        createdAt: new Date()
    },
    {
        name: "Dell G15 5520",
        brand: "Dell",
        price: 29000,
        oldPrice: 33000,
        image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=500",
        category: "Gaming",
        processor: "Intel Core i5-12500H",
        ram: "8GB DDR5",
        storage: "512GB SSD",
        gpu: "RTX 3050 Ti",
        screen: "15.6\" FHD 120Hz",
        useCase: "gaming",
        rating: 4.4,
        reviewCount: 87,
        soldCount: 56,
        stock: "limited",
        description: "Dell G15 لابتوب جيمنج بسعر مناسب ومواصفات جيدة للمبتدئين",
        featured: false,
        createdAt: new Date()
    },
    {
        name: "Acer Nitro 5",
        brand: "Acer",
        price: 27000,
        image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500",
        category: "Gaming",
        processor: "AMD Ryzen 5 5600H",
        ram: "8GB DDR4",
        storage: "512GB SSD",
        gpu: "GTX 1650",
        screen: "15.6\" FHD 144Hz",
        useCase: "gaming",
        rating: 4.3,
        reviewCount: 134,
        soldCount: 89,
        stock: "in-stock",
        description: "Acer Nitro 5 خيار اقتصادي ممتاز للجيمنج والاستخدام اليومي",
        featured: false,
        createdAt: new Date()
    }
];

// To add to Firebase:
// 1. Go to Firebase Console
// 2. Navigate to Firestore Database
// 3. Create collection "laptops" if it doesn't exist
// 4. Add each laptop as a new document

// Or use the Admin Dashboard at /admin to add products through the UI

export default sampleLaptops;
