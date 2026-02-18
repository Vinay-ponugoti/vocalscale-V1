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
