
/**
 * Semantic Search Utility
 * Simulates vector search using weighted feature scoring.
 */

// Feature weights/dimensions
const FEATURE_DIMENSIONS = {
    GAMING: 'gaming',
    WORKSTATION: 'workstation',
    PORTABILITY: 'portability',
    BATTERY: 'battery',
    DISPLAY: 'display',
    BUDGET: 'budget', // Low score = expensive, High score = cheap
    APPLE: 'apple' // Specific dimension for ecosystem preference
};

// Keywords mapping to dimensions
const KEYWORD_MAPPINGS = {
    [FEATURE_DIMENSIONS.GAMING]: ['gaming', 'game', 'fps', 'nvidia', 'rtx', 'gtx', 'play', 'ألعاب', 'جيمنج', 'لعب'],
    [FEATURE_DIMENSIONS.WORKSTATION]: ['work', 'coding', 'programming', 'editing', 'render', '3d', 'autocad', 'design', 'professional', 'عمل', 'برمجة', 'تصميم', 'مونتاج'],
    [FEATURE_DIMENSIONS.PORTABILITY]: ['light', 'thin', 'travel', 'carry', 'weight', 'small', 'air', 'خفيف', 'رفيع', 'سفر'],
    [FEATURE_DIMENSIONS.BATTERY]: ['battery', 'long', 'hours', 'unplugged', 'day', 'بطارية', 'طويلة', 'يوم'],
    [FEATURE_DIMENSIONS.TYPE_STUDENT]: ['student', 'study', 'school', 'college', 'homework', 'طالب', 'دراسة', 'مدرسة', 'جامعة'],
    [FEATURE_DIMENSIONS.DISPLAY]: ['screen', 'oled', '4k', 'color', 'accurate', 'shasha', 'شاشة', 'الوان'],
    [FEATURE_DIMENSIONS.APPLE]: ['mac', 'macbook', 'apple', 'ios', 'ecosystem', 'ماك', 'أبل']
};

/**
 * Calculates a feature vector for a laptop based on its specs/performance
 * Returns an object with scores 0-100 for each dimension
 */
const calculateLaptopVector = (laptop) => {
    const prices = [15000, 50000]; // Min/Max range for normalization
    const normalizedPrice = Math.max(0, Math.min(100, 100 - ((laptop.price - prices[0]) / (prices[1] - prices[0])) * 100));

    const vector = {
        [FEATURE_DIMENSIONS.GAMING]: laptop.performance?.gaming || 0,
        [FEATURE_DIMENSIONS.WORKSTATION]: laptop.performance?.workstation || 0,
        [FEATURE_DIMENSIONS.BATTERY]: laptop.performance?.battery || 0,
        [FEATURE_DIMENSIONS.BUDGET]: normalizedPrice,

        // Approximate portability based on screen size (smaller = more portable usually)
        [FEATURE_DIMENSIONS.PORTABILITY]: laptop.specs?.screen?.includes('13') || laptop.specs?.screen?.includes('14') ? 90 :
            laptop.specs?.screen?.includes('15') ? 60 : 40,

        [FEATURE_DIMENSIONS.DISPLAY]: laptop.specs?.screen?.includes('OLED') || laptop.specs?.screen?.includes('Retina') || laptop.specs?.screen?.includes('QHD') ? 90 :
            laptop.specs?.screen?.includes('FHD') ? 60 : 40,

        [FEATURE_DIMENSIONS.APPLE]: laptop.brand.toLowerCase() === 'apple' ? 100 : 0
    };

    return vector;
};

/**
 * Parses a user query string into a weighted target vector
 */
const parseQueryToVector = (query) => {
    const q = query.toLowerCase();
    const vector = {};

    // Initialize query vector
    Object.values(FEATURE_DIMENSIONS).forEach(dim => vector[dim] = 0);

    // Check for explicit price constraints
    const priceMatch = q.match(/(\d+)(k|000)?/);
    if (priceMatch) {
        // If user mentions a price, we prioritize budget matching
        vector[FEATURE_DIMENSIONS.BUDGET] = 100; // Just signal that budget is important
    }

    // Map keywords to dimensions
    for (const [dimension, keywords] of Object.entries(KEYWORD_MAPPINGS)) {
        if (keywords.some(k => q.includes(k))) {
            vector[dimension] = 100;
        }
    }

    // Special case for 'student' -> Low cost + Good battery + decent portability
    if (q.includes('student') || q.includes('study') || q.includes('طالب')) {
        vector[FEATURE_DIMENSIONS.BUDGET] = Math.max(vector[FEATURE_DIMENSIONS.BUDGET], 80);
        vector[FEATURE_DIMENSIONS.BATTERY] = Math.max(vector[FEATURE_DIMENSIONS.BATTERY], 70);
        vector[FEATURE_DIMENSIONS.PORTABILITY] = Math.max(vector[FEATURE_DIMENSIONS.PORTABILITY], 70);
    }

    return vector;
};

/**
 * Calculates similarity score between query vector and laptop vector
 */
const calculateSimilarity = (queryVec, laptopVec) => {
    let score = 0;
    let maxPossibleScore = 0;
    const reasons = [];

    // Check explicit hard constraints first
    // If user asked for Apple, penalize non-Apple heavily
    if (queryVec[FEATURE_DIMENSIONS.APPLE] > 0 && laptopVec[FEATURE_DIMENSIONS.APPLE] === 0) {
        return { score: 0, reasons: [] };
    }

    // Calculate weighted dot product
    for (const dim of Object.values(FEATURE_DIMENSIONS)) {
        const weight = queryVec[dim]; // How much user cares about this
        if (weight > 0) {
            const laptopScore = laptopVec[dim];
            score += (weight * laptopScore);
            maxPossibleScore += (weight * 100);

            // Generate "Why" reasons
            if (laptopScore > 80) {
                if (dim === FEATURE_DIMENSIONS.GAMING) reasons.push("Top-tier Gaming Performance");
                if (dim === FEATURE_DIMENSIONS.WORKSTATION) reasons.push("Excellent for Professional Work");
                if (dim === FEATURE_DIMENSIONS.BATTERY) reasons.push("All-Day Battery Life");
                if (dim === FEATURE_DIMENSIONS.PORTABILITY) reasons.push("Highly Portable");
                if (dim === FEATURE_DIMENSIONS.DISPLAY) reasons.push("Stunning Display");
                if (dim === FEATURE_DIMENSIONS.BUDGET) reasons.push("Great Value for Money");
            }
        }
    }

    // Normalize to 0-100 percentage
    const finalScore = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;

    return {
        score: Math.round(finalScore),
        reasons: [...new Set(reasons)] // Remove duplicates
    };
};

/**
 * Main search function
 */
export const searchLaptops = (query, laptops) => {
    if (!query) return [];

    const queryVec = parseQueryToVector(query);

    // Safety check: if query didn't match any known keywords, default to generic popularity or perform basic string match
    // For now we'll just search by name if vector is empty
    const isGeneric = Object.values(queryVec).every(v => v === 0);

    let scoredResults = laptops.map(laptop => {
        let match;
        if (isGeneric) {
            // Fallback to simple name match if no specific features requested
            const nameMatch = laptop.name.toLowerCase().includes(query.toLowerCase()) ||
                laptop.brand.toLowerCase().includes(query.toLowerCase());
            match = { score: nameMatch ? 80 : 0, reasons: nameMatch ? ['Name Match'] : [] };
        } else {
            const laptopVec = calculateLaptopVector(laptop);
            match = calculateSimilarity(queryVec, laptopVec, laptop);
        }

        // Budget hard filter if detected in query text (simple regex)
        // This is a hybrid approach: soft vector matching + hard constraints
        const priceMatch = query.match(/(\d+)/); // Very simple price extraction
        if (priceMatch) {
            const budgetLimit = parseInt(priceMatch[0]) * (query.toLowerCase().includes('k') || query.includes('الف') ? 1000 : 1);
            // If price mentioned looks like a limit (e.g. "under 20k"), and laptop is way more expensive
            if ((query.includes('under') || query.includes('less') || query.includes('تحت')) && laptop.price > budgetLimit) {
                match.score *= 0.5; // Penalize heavily but don't hide completely
            }
        }

        return {
            ...laptop,
            matchScore: match.score,
            matchReasons: match.reasons
        };
    });

    return scoredResults
        .filter(item => item.matchScore > 40) // Threshold
        .sort((a, b) => b.matchScore - a.matchScore);
};
