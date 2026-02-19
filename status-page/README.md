# 📊 VocalScale Status Page

Automated status monitoring for VocalScale platform services.

## 🚀 Quick Start

### Check Status
```bash
python3 .agent/tasks/automate-status-page.py
```

### Deploy to Cloudflare
```bash
cd status-page
npm install -g wrangler
wrangler login
wrangler pages deploy
```

## 📡 Monitored Services

| Service | URL | Status |
|---------|-----|--------|
| API Gateway | api.vocalscale.com | ✅ |
| Authentication | supabase.co | ⚠️ |
| Payment Service | billing.vocalscale.com | ⚠️ |
| Knowledge Engine | api.vocalscale.com/knowledge | ⚠️ |
| Website | www.vocalscale.com | ✅ |

## 📊 Reports

Status reports are saved to: `.status-report.md`

## 🔗 Live Status

https://status.vocalscale.com
