# 🚀 Deploy & Test VocalScale Status Page on Cloudflare

## Quick Deploy (3 Steps)

### Step 1: Install Wrangler (Cloudflare CLI)
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
```bash
wrangler login
```
This will open a browser. Authorize the app.

### Step 3: Deploy
```bash
cd status-page
wrangler pages deploy . --project-name=vocalscale-status
```

Or use the automated script:
```bash
bash scripts/deploy/deploy-status-page.sh
```

---

## 🧪 Test the Deployment

### Test 1: Check Page Loads
```bash
curl -I https://vocalscale-status.pages.dev
```

Expected: HTTP 200 OK

### Test 2: View the Page
```bash
curl https://vocalscale-status.pages.dev
```

### Test 3: Check Services
Open in browser: https://vocalscale-status.pages.dev

Wait 60 seconds for initial health checks to complete.

---

## 🎯 Add Custom Domain (Optional)

### Option A: status.vocalscale.com
1. Go to: https://dash.cloudflare.com/
2. Click: Workers & Pages
3. Select: vocalscale-status
4. Click: Custom domains
5. Click: Set up a custom domain
6. Enter: status.vocalscale.com
7. Update DNS: Add CNAME record pointing to pages.dev

### Option B: Keep .pages.dev
No setup needed! Just use: https://vocalscale-status.pages.dev

---

## 📊 Status Check Script

After deployment, run regularly:

```bash
python3 .agent/tasks/automate-status-page.py
```

This will:
- Monitor all services
- Generate reports
- Alert if services are down
- Can re-deploy if needed

---

## 🔧 Troubleshooting

### Login Issues
```bash
wrangler logout
wrangler login
```

### Project Already Exists
```bash
# Check existing projects
wrangler pages project list

# Delete and recreate
wrangler pages project delete vocalscale-status
wrangler pages deploy . --project-name=vocalscale-status
```

### View Logs
```bash
wrangler pages tail --project-name=vocalscale-status
```

---

## 🎯 What You Get After Deploy

✅ Live status page at: https://vocalscale-status.pages.dev
✅ Real-time health monitoring
✅ 5 services monitored
✅ Auto-refresh every 60 seconds
✅ Works on mobile devices
✅ Professional design

---

*Deploy and test today!*
