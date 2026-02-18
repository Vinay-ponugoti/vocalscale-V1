# Frontend Security Audit Report
## VocalScale Frontend - main-vocalscale-frontend

**Date:** 2026-02-16  
**Scope:** Security scan of React/Vite frontend  
**Severity Levels:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## 🔴 Critical Issues

### 1. dangerouslySetInnerHTML Without Sanitization
**Location:** 
- `src/pages/blog/BlogPost.tsx:90`
- `src/pages/blog/index.tsx:151`

**Issue:** Uses `dangerouslySetInnerHTML` on blog post content without DOMPurify or sanitization.

**Risk:** If blog content becomes dynamic or user-contributed, XSS attacks could inject malicious scripts.

**Fix:**
```bash
npm install dompurify @types/dompurify
```

```tsx
import DOMPurify from 'dompurify';

// Sanitize before rendering
const sanitizedContent = DOMPurify.sanitize(post.content);
<div dangerouslySetInnerHTML={{ __html: sanitizedContent }} />
```

---

## 🟠 High Issues

### 2. Weak Content Security Policy (CSP)
**Location:** `index.html:7`

**Issue:** CSP allows `'unsafe-inline'` and `'unsafe-eval'` which:
- Allows inline scripts (XSS attack vector)
- Allows eval() execution (code injection)
- Defeats most XSS protection CSP is meant to provide

**Current:**
```
default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'
script-src 'self' 'unsafe-inline' 'unsafe-eval' https:
```

**Recommend Fix:**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'nonce-{RANDOM}' https://challenges.cloudflare.com https://www.clarity.ms https://scripts.clarity.ms;
  style-src 'self' https://fonts.googleapis.com;
  img-src 'self' https: data: blob: https://c.bing.com https://*.clarity.ms;
  connect-src 'self' https: wss: https://api.vocalscale.com https://billing.vocalscale.com https://knowledge.vocalscale.com https://*.supabase.co wss://*.supabase.co https://formsubmit.co https://*.clarity.ms;
  font-src 'self' https://fonts.gstatic.com;
  frame-src https://challenges.cloudflare.com;
  media-src 'self' https: https://*.r2.dev https://api.vocalscale.com;
">
```

---

### 3. Authentication Token Storage
**Location:** 
- `src/context/AuthContext.tsx` (multiple lines)
- `src/utils/storageUtils.ts`

**Issue:** Tokens may be stored in localStorage which is vulnerable to XSS attacks.

**Risk:** If XSS occurs, attacker can steal tokens and impersonate users.

**Recommendation:** 
- Use **httpOnly cookies** for tokens (handled by backend)
- If localStorage is needed, implement strict CSP and XSS protection
- Add CSRF tokens for additional protection

---

### 4. Hardcoded IP Address in CSP
**Location:** `index.html:7`

**Issue:** CSP includes hardcoded IP: `http://34.132.14.121:8001`

**Risk:**
- Exposes backend infrastructure
- Could be used for fingerprinting/attack prep
- Hard to maintain when IP changes

**Fix:** Remove hardcoded IP, use domain names only.

---

## 🟡 Medium Issues

### 5. Potential XSS via innerHTML in FullCalendar
**Location:** `src/pages/dashboard/Appointments/index.tsx:270`

**Code:**
```tsx
ghost.innerHTML = `<span class="font-bold">${appt.customer_name}</span>`;
```

**Risk:** If `customer_name` comes from user input, could inject HTML/JS.

**Fix:** Use `.textContent` instead:
```tsx
ghost.textContent = appt.customer_name;
ghost.className = 'font-bold';
```

---

### 6. No Rate Limiting on Forms
**Locations:** 
- `src/pages/auth/Login.tsx`
- `src/pages/auth/Signup.tsx`
- `src/pages/auth/ForgotPassword.tsx`

**Issue:** Forms lack client-side rate limiting.

**Risk:** Brute force attacks on login, password reset abuse.

**Fix:** Create rate limiting hook:
```tsx
// hooks/useThrottle.ts
import { useState, useCallback, useRef } from 'react';

export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef(0);
  
  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall.current >= delay) {
      lastCall.current = now;
      callback(...args);
    }
  }, [callback, delay]) as T;
}
```

```tsx
// Usage
const throttledLogin = useThrottle(handleLogin, 2000);
```

---

### 7. Missing CSRF Protection
**Issue:** API calls don't include CSRF tokens.

**Locations:** All fetch calls in `src/api/` folder.

**Fix:** If backend uses CSRF, add to request headers:
```tsx
const response = await fetch(`${env.API_URL}/endpoint`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': getCSRFToken(), // from cookie or meta tag
  },
  credentials: 'include', // send cookies
});
```

---

## 🟢 Low Issues

### 8. Analytics & Tracking Identifiers Exposed
**Hardcoded IDs in index.html:**
- Clarity: `ve8uvwhwb7`
- GA4: `G-ZX6K9J9X`

**Fix:** Move to environment variables:
```html
<script>
  const CLARITY_ID = import.meta.env.VITE_CLARITY_ID;
  const GA_ID = import.meta.env.VITE_GA_ID;
</script>
```

---

### 9. Production Error Logging in Console
**Location:** `src/context/AuthContext.tsx:371`

**Code:**
```tsx
console.error("Background token sync failed", e);
```

**Risk:** In production, this could leak implementation details.

**Fix:**
```tsx
if (import.meta.env.PROD) {
  // Send to error tracking (Sentry, LogRocket, etc)
  errorTracker.capture(e);
} else {
  console.error("Background token sync failed", e);
}
```

---

### 10. Verbose Chunk Names in Build
**Location:** `vite.config.ts:10-15`

**Issue:** Manual chunks reveal tech stack structure.

**Fix:** Use simple naming:
```tsx
manualChunks: {
  vendor: ['react', 'react-dom', 'react-router-dom'],
  ui: ['lucide-react', 'clsx', 'tailwind-merge'],
  supabase: ['@supabase/supabase-js'],
  motion: ['framer-motion'],
// Instead of: vendor: ['react', 'react-dom', 'react-router-dom', 'date-fns']
```

---

## 📋 Action Items (Priority Order)

### Immediate (This Week)
1. [ ] Install DOMPurify and sanitize `dangerouslySetInnerHTML`
2. [ ] Remove hardcoded IP `http://34.132.14.121:8001` from CSP
3. [ ] Fix FullCalendar `innerHTML` → use `textContent`

### Short Term (Next 2 Weeks)
4. [ ] Strengthen CSP - remove `'unsafe-inline'`/`'unsafe-eval'`
5. [ ] Add rate limiting to login/signup forms
6. [ ] Move analytics IDs to `.env` variables
7. [ ] Review token storage strategy (consider httpOnly cookies)

### Medium Term (Next Month)
8. [ ] Add security headers via Vercel/Vite:
   - X-Frame-Options: DENY
   - X-Content-Type-Options: nosniff  
   - Referrer-Policy: strict-origin-when-cross-origin
   - Permissions-Policy: camera=(), microphone=()
9. [ ] Implement CSP Report-Only for testing
10. [ ] Add CSRF tokens if backend requires

### Long Term
11. [ ] Security audit: `npm audit`
12. [ ] Dependency audit: `npm audit fix`
13. [ ] Add Subresource Integrity (SRI) for external scripts
14. [ ] CSP violation monitoring
15. [ ] Error boundary for production crashes

---

## 🛠️ Quick Implementation Files

### 1. Safe HTML Component
Create: `src/components/SafeHtml.tsx`
```tsx
import DOMPurify from 'dompurify';

interface SafeHtmlProps {
  html: string;
  className?: string;
  allowedTags?: string[];
}

export function SafeHtml({ 
  html, 
  className,
  allowedTags = ['p', 'h1', 'h2', 'h3', 'strong', 'em', 'ul', 'ol', 'li', 'blockquote', 'br', 'a']
}: SafeHtmlProps) {
  const sanitized = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }} 
    />
  );
}
```

### 2. Security Headers (Vercel)
Create: `frontend/vercel.json`
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

### 3. CSP Nonce Utility
Create: `src/utils/csp.ts`
```tsx
export function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// Use in main.tsx
// const nonce = generateNonce();
```

---

## 🔍 Development Security Checklist

Add to your development workflow:

### 1. Pre-commit Security Check
Create `.husky/pre-commit`:
```bash
#!/bin/bash
npm run security:audit
npm run build
```

### 2. NPM Audit Script
Add to `package.json`:
```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=moderate",
    "security:fix": "npm audit fix",
    "security:check": "npm run security:audit && npm outdated"
  }
}
```

### 3. CSP Testing
Use CSP Evaluator: https://csp-evaluator.withgoogle.com/

---

## 📊 Vulnerability Summary

| Severity | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 1 | Needs Fix |
| 🟠 High | 3 | Needs Fix |
| 🟡 Medium | 3 | Review |
| 🟢 Low | 3 | Nice to Have |

**Total Vulnerabilities:** 10

---

## 🎯 Recommended Tools

1. **DOMPurify** - XSS sanitization
2. **npm audit** - Dependency security
3. **Snyk** - Advanced vulnerability scanning
4. **Sentry** - Error tracking & security
5. **CSP Evaluator** - Test CSP policies

---

## 📞 Additional Help

- NPM Security: https://docs.npmjs.com/cli/v9/commands/npm-audit
- CSP Guide: https://content-security-policy.com/
- OWASP XSS: https://owasp.org/www-community/attacks/xss/
- React Security: https://react.dev/learn/keeping-components-pure

---

**Generated by:** OpenClaw Agent  
**Scan Date:** 2026-02-16  
**Next Review:** 2026-03-16
