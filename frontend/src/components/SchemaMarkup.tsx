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

export default SchemaMarkup;

// ─── Schema factory functions and data objects ─────────────────────────────

export function webPageSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url: `https://www.vocalscale.com${path}`,
  };
}

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'VocalScale',
  url: 'https://www.vocalscale.com',
  logo: 'https://www.vocalscale.com/logo.png',
  sameAs: [],
};

export const productSchema = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'VocalScale AI Voice Agent',
  description: 'AI voice agents that handle customer calls, book appointments, and answer inquiries 24/7.',
  brand: {
    '@type': 'Brand',
    name: 'VocalScale',
  },
};
