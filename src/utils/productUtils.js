export const getUseCase = (product) => {
    const gpu = product.specs?.gpu?.toLowerCase() || '';
    const cpu = product.specs?.cpu?.toLowerCase() || '';

    if (gpu.includes('rtx') || gpu.includes('4060') || gpu.includes('4070') || gpu.includes('4080')) {
        return { key: 'gaming', icon: '🎮', color: 'gaming' };
    }
    if (cpu.includes('i9') || cpu.includes('i7') || gpu.includes('quadro') || gpu.includes('a2000')) {
        return { key: 'work', icon: '💼', color: 'work' };
    }
    if (product.price < 20000) {
        return { key: 'student', icon: '🎓', color: 'student' };
    }
    return { key: 'work', icon: '💼', color: 'work' };
};

// Mock data generators (separated from UI component)
export const getMockSoldCount = (productId) => {
    const hash = productId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return (hash % 50) + 10; // 10-60 sold
};

export const getMockRating = (productId) => {
    const hash = productId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return (4 + (hash % 10) / 10).toFixed(1); // 4.0-4.9
};

export const getMockReviewCount = (productId) => {
    const hash = productId.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return (hash % 80) + 5; // 5-85 reviews
};

export const calculateDiscount = (price, oldPrice) => {
    const hasDiscount = oldPrice && oldPrice > price;
    return hasDiscount ? Math.round(((oldPrice - price) / oldPrice) * 100) : 0;
};
