import { Helmet } from 'react-helmet-async';

const SEO = ({
    title,
    description,
    image,
    url,
    type = 'website',
    keywords,
    noIndex = false,
    structuredData,
    breadcrumbs // NEW: Array of {name, url} objects
}) => {
    const siteName = 'A Plus+';
    const defaultImage = 'https://i.ibb.co/0jZ1Z1Q/a-plus-logo.png';
    const baseUrl = 'https://a-plus-laptops.vercel.app';

    const fullTitle = title ? `${title} | ${siteName}` : `${siteName} | Gaming Laptops Store`;
    const fullUrl = url ? `${baseUrl}${url}` : baseUrl;
    const ogImage = image || defaultImage;

    // Generate BreadcrumbList structured data
    const breadcrumbSchema = breadcrumbs ? {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": `${baseUrl}${crumb.url}`
        }))
    } : null;

    // Combine all structured data
    const allStructuredData = [];
    if (structuredData) allStructuredData.push(structuredData);
    if (breadcrumbSchema) allStructuredData.push(breadcrumbSchema);

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}
            {noIndex && <meta name="robots" content="noindex, nofollow" />}
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={ogImage} />
            <meta property="og:site_name" content={siteName} />
            <meta property="og:locale" content="en_US" />
            <meta property="og:locale:alternate" content="ar_EG" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:url" content={fullUrl} />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage} />

            {/* Structured Data (JSON-LD) */}
            {allStructuredData.map((data, index) => (
                <script key={index} type="application/ld+json">
                    {JSON.stringify(data)}
                </script>
            ))}
        </Helmet>
    );
};

export default SEO;
