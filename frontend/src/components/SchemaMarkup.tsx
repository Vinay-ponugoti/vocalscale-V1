import { useEffect } from 'react';

interface SchemaMarkupProps {
  schema: object;
  type: 'Organization' | 'Product' | 'FAQPage' | 'Review' | 'LocalBusiness' | 'Article' | 'WebPage';
}

export function SchemaMarkup({ schema, type }: SchemaMarkupProps) {
  useEffect(() => {
    const scriptId = `schema-markup-${type.toLowerCase()}`;

    // Remove existing script if it exists
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create new script element
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = scriptId;
    script.textContent = JSON.stringify(schema);

    // Append to document head
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [schema, type]);

  return null;
}



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

export default SchemaMarkup;