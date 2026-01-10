import ReactGA from "react-ga4";
import TagManager from "react-gtm-module";

// Initialize GA4 or GTM
export const initAnalytics = (measurementId, gtmId) => {
    // If GTM ID is provided, initialize GTM
    if (gtmId) {
        const tagManagerArgs = {
            gtmId: gtmId
        };
        TagManager.initialize(tagManagerArgs);
        console.log("GTM Initialized");
    }

    // Initialize GA4 specifically (even with GTM, sometimes useful for direct events)
    // Or if GTM is not used.
    if (measurementId) {
        ReactGA.initialize(measurementId);
        console.log("GA4 Initialized");
    }
};

// Also keep initGA for backward compatibility if needed, but we can deprecate or alias it
export const initGA = (id) => initAnalytics(id, null);

// User ID Tracking
export const setUserId = (userId) => {
    if (userId) {
        ReactGA.set({ user_id: userId });
        // Also push to GTM dataLayer
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
            'event': 'login',
            'userId': userId
        });
    }
};

// Error Tracking
export const trackException = (description, fatal = false) => {
    ReactGA.event("exception", {
        description,
        fatal
    });
    // GTM: Push error event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'error',
        'errorDescription': description,
        'isFatal': fatal
    });
};

// Generic Event Tracker
export const trackEvent = ({ category, action, label, value }) => {
    ReactGA.event({
        category,
        action,
        label, // optional
        value, // optional, must be a number
    });

    // Provide a GTM fallback for generic events if needed
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
        'event': 'customEvent',
        'eventCategory': category,
        'eventAction': action,
        'eventLabel': label,
        'eventValue': value
    });
};

// Specific Events

export const trackPageView = (path) => {
    ReactGA.send({ hitType: "pageview", page: path });
};

export const trackViewItem = (product) => {
    ReactGA.event("view_item", {
        currency: "EGP",
        value: product.price,
        items: [
            {
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                item_category: product.category || "Laptop",
            },
        ],
    });
};

export const trackAddToCart = (product) => {
    ReactGA.event("add_to_cart", {
        currency: "EGP",
        value: product.price,
        items: [
            {
                item_id: product.id,
                item_name: product.name,
                price: product.price,
                item_category: product.category || "Laptop",
            },
        ],
    });
};

export const trackBeginCheckout = (totalValue) => {
    ReactGA.event("begin_checkout", {
        currency: "EGP",
        value: totalValue,
    });
};

export const trackPurchase = (transactionId, totalValue, items) => {
    ReactGA.event("purchase", {
        transaction_id: transactionId,
        currency: "EGP",
        value: totalValue,
        items: items.map((item) => ({
            item_id: item.id,
            item_name: item.name,
            price: item.price,
            quantity: item.quantity,
        })),
    });
};

export const trackSearch = (searchTerm) => {
    ReactGA.event("search", {
        search_term: searchTerm,
    });
};

export const trackFilter = (filterType, filterValue) => {
    trackEvent({
        category: "User Interaction",
        action: "Used Filter",
        label: `${filterType}: ${filterValue}`,
    });
};
