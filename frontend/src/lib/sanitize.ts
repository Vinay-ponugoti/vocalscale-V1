/**
 * HTML sanitization utility
 * Uses DOMPurify to prevent XSS attacks when rendering user-generated HTML
 */

import DOMPurify from 'dompurify';

// Configure DOMPurify hooks for additional security measures
DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  // Add rel="noopener noreferrer" to all links to prevent tabnabbing
  if (data.attrName === 'href') {
    node.setAttribute('rel', 'noopener noreferrer');

    // Allow only specific protocols in href
    const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:'];
    if (!allowedProtocols.includes((node as any).protocol || '')) {
      // Remove invalid href
      data.attrValue = '';
    }
  }

  // Remove target="_blank" as we're adding noopener noreferrer
  if (data.attrName === 'target') {
    data.attrValue = '';
  }
});

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  // Remove dangerous tags entirely
  if (data.tagName === 'script') {
    data.allowedTags!.script = false;
  }
});

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty The untrusted HTML string
 * @param options Optional DOMPurify configuration
 * @returns Sanitized HTML safe to render
 */
export function sanitizeHtml(dirty: string, options?: { allowedTags?: string[], allowedAttributes?: Record<string, string[]> }): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: options?.allowedTags || [
      'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'pre', 'code',
      'br', 'hr', 'div', 'span',
      'table', 'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: options?.allowedAttributes || [
      'href', 'alt', 'title', 'class',
      'rel', 'target'  // We control 'rel' and 'target' via hooks
    ],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout'],
    ...options
  });
}

/**
 * Escape HTML entities to prevent XSS
 * Use this instead of dangerouslySetInnerHTML when possible
 * @param text The text to escape
 * @returns Escaped HTML string
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitize a URL string to prevent javascript: and data: protocol attacks
 * @param url The URL to sanitize
 * @returns Sanitized URL safe to use in href/src attributes
 */
export function sanitizeUrl(url: string): string {
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:', '/'];
  try {
    const parsed = new URL(url, window.location.origin);
    if (!allowedProtocols.includes(parsed.protocol)) {
      return '#'; // Return hash for invalid protocols
    }
    return url;
  } catch {
    // If URL parsing fails, it's likely invalid
    return '#';
  }
}

export default sanitizeHtml;
