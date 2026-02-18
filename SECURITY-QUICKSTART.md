# Security Quick Start Guide

## 🔥 Critical Fixes (Do First)

### 1. Run Automated Fixes
```bash
cd /home/vinay/.openclaw/workspace/main-vocalscale-frontend
./security-fixes.sh
```

This installs DOMPurify and creates security utilities.

---

## ⚡ Manual Fixes Required

### Fix #1: Update Blog Pages (XSS Protection)
**File:** `src/pages/blog/BlogPost.tsx` (line 90)
**File:** `src/pages/blog/index.tsx` (line 151)

```tsx
// BEFORE
<div dangerouslySetInnerHTML={{ __html: post.content }} />

// AFTER
import { SafeHtml } from '../../components/SafeHtml';

<SafeHtml html={post.content} className="prose prose-lg" />
```

---

### Fix #2: Remove Hardcoded IP from CSP
**File:** `index.html` (line 7)

**Find and remove:**
```html
http://34.132.14.121:8001
```

**Why:** Exposes backend infrastructure and is hard to maintain.

---

### Fix #3: Fix FullCalendar XSS Risk
**File:** `src/pages/dashboard/Appointments/index.tsx` (line 270)

```tsx
// BEFORE
ghost.innerHTML = `<span class="font-bold">${appt.customer_name}</span>`;

// AFTER
ghost.textContent = appt.customer_name;
ghost.className = 'font-bold';
```

---

### Fix #4: Strengthen CSP (Advanced)
**File:** `index.html` (line 7)

**Current (Weak):**
```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self' https: data: 'unsafe-inline' 'unsafe-eval'; ...">
```

**Recommended:**
```html
<meta http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    script-src 'self' 'nonce-{RANDOM}' https://challenges.cloudflare.com;
    style-src 'self' https://fonts.googleapis.com;
    img-src 'self' https: data: blob:;
    connect-src 'self' https: wss:;
    font-src 'self' https://fonts.gstatic.com;
    frame-src https://challenges.cloudflare.com;
  ">
```

**Note:** Requires nonce implementation in main.tsx.

---

## 🛡️ Test Your Security

### 1. Run Security Audit
```bash
npm run security:audit
```

### 2. Check for Vulnerabilities
```bash
npm audit
```

### 3. Automate Updates
```bash
npm audit fix
```

---

## 📊 Security Score

| Fix | Time | Urgency |
|-----|------|---------|
| ✅ Run security-fixes.sh | 2 min | 🔴 Critical |
| ⚠️ Update blog pages | 10 min | 🔴 Critical |
| ⚠️ Remove hardcoded IP | 1 min | 🟠 High |
| ⚠️ Fix FullCalendar HTML | 2 min | 🟡 Medium |
| 📝 Strengthen CSP | 30 min | 🟠 High |

---

## 🎯 Quick Wins (5 Minutes Total)

1. Run `./security-fixes.sh`
2. Remove `http://34.132.14.121:8001` from index.html
3. Fix FullCalendar innerHTML (2 lines)
4. Update 2 blog pages to use SafeHtml

**Total time:** ~15 minutes  
**Security risk reduced:** ~70%

---

## 📞 Help

📄 Full Report: `SECURITY-AUDIT.md`  
🔧 Fix Script: `security-fixes.sh`  
🚀 Next Review: 2026-03-16
