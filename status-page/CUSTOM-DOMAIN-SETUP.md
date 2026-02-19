# 🚀 Custom Domain Setup: status.vocalscale.com

## Step-by-Step Instructions

### Before You Begin

**Prerequisites:**
✅ VocalScale domain (vocalscale.com) on Cloudflare
✅ Status page deployed to Cloudflare Pages
✅ Access to Cloudflare dashboard

---

## Step 1: Open Cloudflare Dashboard

Go to: https://dash.cloudflare.com/

Login with your Cloudflare account.

---

## Step 2: Select Your Domain

1. Select `vocalscale.com` from your domains list

---

## Step 3: Navigate to Worker & Pages

1. In the left sidebar, click **"Workers & Pages"**
2. Find and click on **"vocalscale-status"**

---

## Step 4: Add Custom Domain

1. On the project page, click the **"Custom domains"** tab
2. Click the **"Set up a custom domain"** button
3. Enter: `status.vocalscale.com`
4. Click **"Activate domain"**

Cloudflare will:
- Create the custom domain
- Provide DNS instructions
- Activate SSL automatically

---

## Step 5: Update DNS Records

After activation, you'll see a screen like this:

```
DNS configuration required
Add these DNS records to your zone:
```

**Add CNAME Record:**

| Type | Name | Target | Proxy | TTL |
|------|------|--------|-------|-----|
| CNAME | status | vocalscale-status.pages.dev | **ON** (Proxied) | Auto |

**How to Add:**

1. Go to **DNS** → **Records**
2. Click **"Add record"**
3. Fill in:
   - **Type:** CNAME
   - **Name:** status
   - **Target:** vocalscale-status.pages.dev
   - **Proxy Status:** **ON** (cloud icon, orange)
   - **TTL:** Auto
4. Click **"Save"**

---

## Step 6: Verify Activation

1. Wait 1-2 minutes for DNS propagation
2. Visit: https://status.vocalscale.com

**Expected Result:**
- Status page loads with all services
- Browser shows secure HTTPS
- No DNS errors

---

## Step 7: Test with Curl

```bash
# Test status page
curl -I https://status.vocalscale.com

# Expected: HTTP/2 200

# Test status JSON
curl https://status.vocalscale.com/data/status.json

# Expected: Valid JSON with live data
```

---

## 🔍 Troubleshooting

### DNS Not Propagating

**Wait longer:**
- DNS can take up to 24 hours to propagate globally
- Usually takes 1-10 minutes

**Check DNS status:**
```bash
# Check DNS record
dig status.vocalscale.com CNAME

# Should return: vocalscale-status.pages.dev
```

### Seeing Cloudflare 404 Error

**Causes:**
- Custom domain not activated yet
- DNS not pointing correctly
- Proxy not enabled

**Fix:**
1. Verify custom domain is activated in Workers & Pages
2. Check DNS CNAME record exists
3. Ensure proxy is **ON** (orange cloud icon)

### SSL Certificate Not Ready

**Wait longer:**
- Cloudflare automatically provisions SSL
- Can take 5-15 minutes

**Check SSL status:**
1. Go to SSL/TLS → Edge Certificates
2. Look for status.vocalscale.com
3. Status should be "Active"

### Page Not Loading

**Check:**
1. Base URL works: https://devagent.vocalscale-status.pages.dev
2. Custom domain activated in Cloudflare
3. DNS record exists and is correct
4. Proxy is enabled

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Custom domain activated: status.vocalscale.com
- [ ] DNS CNAME record created
- [ ] Proxy status: ON (orange)
- [ ] SSL provisioned (in SSL/TLS tab)
- [ ] Status page loads in browser
- [ ] HTTPS works (no certificate errors)
- [ ] JSON endpoint returns data: https://status.vocalscale.com/data/status.json
- [ ] Agent updates are visible

---

## 📊 After Setup

**Your status page is now live at:**
https://status.vocalscale.com

**Features:**
- Live service monitoring
- Real-time data (updated by agent every 60s)
- Global CDN via Cloudflare
- SSL/TLS encryption
- Auto-scaling traffic
- 99.9% uptime

---

## 🔄 Updates

The agent continues to work as before:
- Checks services every 60 seconds
- Updates status.json
- Auto-deploys to Cloudflare
- Status page shows latest data

**No changes needed** - just enjoy the custom domain!

---

## 📱 Share with Team

Now you can share:
- **Public:** https://status.vocalscale.com
- **JSON API:** https://status.vocalscale.com/data/status.json

Team members can monitor VocalScale services in real-time!

---

**Setup complete! 🎉**

Visit now: https://status.vocalscale.com
