/**
 * JSON-LD Schema definitions for SEO
 */

// Basic WebPage Schema
export const webPageSchema = (title: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": title,
  "description": description,
  "url": `https://www.vocalscale.com${url}`,
  "publisher": {
    "@type": "Organization",
    "name": "VocalScale",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.vocalscale.com/logo.png"
    }
  }
});

// Organization Schema
export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VocalScale",
  "url": "https://www.vocalscale.com",
  "logo": "https://www.vocalscale.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-555-5555",
    "contactType": "customer service"
  },
  "sameAs": [
    "https://twitter.com/vocalscale",
    "https://linkedin.com/company/vocalscale"
  ]
};

// SaaS Product Schema
export const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "VocalScale AI Receptionist",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "150"
  }
};
