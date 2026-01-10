export const laptops = [
    {
        id: 1,
        name: "Legion Pro 7i",
        brand: "Lenovo",
        price: 32000,
        image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&q=80&w=500",
        specs: {
            cpu: "Intel Core i9-13900HX",
            cpuScore: 95,
            gpu: "NVIDIA RTX 4080",
            gpuScore: 92,
            ram: "32GB DDR5",
            storage: "1TB SSD Gen4",
            screen: "16\" WQXGA 240Hz"
        },
        performance: {
            gaming: 95,
            workstation: 92,
            battery: 40
        },
        games: [
            { name: "Cyberpunk 2077", fps: 85, quality: "Ultra" },
            { name: "Call of Duty: MW3", fps: 140, quality: "High" },
            { name: "Elden Ring", fps: 90, quality: "Max" }
        ],
        suitability: ["Gaming", "Video Editing", "3D Modeling", "AutoCAD", "Cyberpunk 2077", "GTA V"],
        stockCount: 15,
        lowStockThreshold: 3
    },
    {
        id: 2,
        name: "ROG Zephyrus G14",
        brand: "ASUS",
        price: 28000,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=500",
        specs: {
            cpu: "AMD Ryzen 9 7940HS",
            cpuScore: 88,
            gpu: "NVIDIA RTX 4070",
            gpuScore: 82,
            ram: "16GB DDR5",
            storage: "1TB SSD",
            screen: "14\" QHD+ 165Hz"
        },
        performance: {
            gaming: 85,
            workstation: 80,
            battery: 75
        },
        games: [
            { name: "Cyberpunk 2077", fps: 65, quality: "High" },
            { name: "Fortnite", fps: 180, quality: "Epic" },
            { name: "Valorant", fps: 300, quality: "Low" }
        ],
        suitability: ["Gaming", "Programming", "Content Creation", "GTA V", "Fortnite"],
        stockCount: 8,
        lowStockThreshold: 5
    },
    {
        id: 3,
        name: "MacBook Pro 16",
        brand: "Apple",
        price: 45000,
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca4?auto=format&fit=crop&q=80&w=500",
        specs: {
            cpu: "M3 Max Chip",
            cpuScore: 98,
            gpu: "30-core GPU",
            gpuScore: 75,
            ram: "36GB Unified",
            storage: "1TB SSD",
            screen: "16.2\" Liquid Retina XDR"
        },
        performance: {
            gaming: 50,
            workstation: 99,
            battery: 100
        },
        games: [
            { name: "Resident Evil Village", fps: 60, quality: "High" },
            { name: "Shadow of Tomb Raider", fps: 75, quality: "High" },
            { name: "Video Editing", fps: 999, quality: "8K Raw" }
        ],
        suitability: ["Video Editing", "Programming", "Music Production", "Graphic Design"],
        stockCount: 3,
        lowStockThreshold: 2
    },
    {
        id: 4,
        name: "Victus 15",
        brand: "HP",
        price: 15000,
        image: "https://images.unsplash.com/photo-1588872657578-139a628e75f2?auto=format&fit=crop&q=80&w=500",
        specs: {
            cpu: "ntel Core i5-12450H",
            cpuScore: 60,
            gpu: "NVIDIA GTX 1650",
            gpuScore: 45,
            ram: "8GB DDR4",
            storage: "512GB SSD",
            screen: "15.6\" FHD 144Hz"
        },
        performance: {
            gaming: 55,
            workstation: 50,
            battery: 60
        },
        games: [
            { name: "GTA V", fps: 70, quality: "High" },
            { name: "League of Legends", fps: 120, quality: "High" },
            { name: "CS2", fps: 100, quality: "Med" }
        ],
        suitability: ["Student", "Light Gaming", "Office Work", "GTA V", "League of Legends"],
        stockCount: 25,
        lowStockThreshold: 5
    },
    {
        id: "ref-1",
        name: "MacBook Air M1",
        brand: "Apple",
        price: 25000,
        image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=500",
        isReference: true,
        specs: {
            cpu: "Apple M1",
            cpuScore: 88,
            gpu: "7-core GPU",
            gpuScore: 60,
            ram: "8GB Unified",
            storage: "256GB SSD",
            screen: "13.3\" Retina"
        },
        performance: {
            gaming: 40,
            workstation: 85,
            battery: 95
        },
        games: [
            { name: "Fortnite", fps: 60, quality: "Med" },
            { name: "League of Legends", fps: 110, quality: "High" }
        ],
        suitability: ["Students", "Office Work", "Light Editing"],
        stockCount: 0,
        lowStockThreshold: 5
    },
    {
        id: "ref-2",
        name: "Dell G15 (Old Gen)",
        brand: "Dell",
        price: 18000,
        image: "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&q=80&w=500",
        isReference: true,
        specs: {
            cpu: "Intel Core i5-10300H",
            cpuScore: 55,
            gpu: "GTX 1650",
            gpuScore: 45,
            ram: "16GB DDR4",
            storage: "512GB SSD",
            screen: "15.6\" FHD 120Hz"
        },
        performance: {
            gaming: 55,
            workstation: 50,
            battery: 45
        },
        games: [
            { name: "GTA V", fps: 65, quality: "High" },
            { name: "CS:GO", fps: 140, quality: "High" }
        ],
        suitability: ["Budget Gaming", "Entry Level"],
        stockCount: 12,
        lowStockThreshold: 5
    }
];
