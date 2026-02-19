# 🤖 VocalScale Status Tracker Agent

**Automated service monitoring with real-time status page at status.vocalscale.com**

---

## 📊 Overview

The Status Tracker Agent is an intelligent, automated system that:
- ✅ Monitors all VocalScale services in real-time
- ✅ Collects accurate health data (no more no-cors guesses)
- ✅ Detects and logs incidents automatically
- ✅ Updates the status page with live data
- ✅ Sends Telegram alerts for issues
- ✅ Runs via local model (Ollama qwen2.5:1.5b)
- ✅ Managed by main LLM with configurable rules
- ✅ Auto-deploys to Cloudflare Pages

---

## 🌐 Public Status Page

**URL:** https://status.vocalscale.com

**Features:**
- Live status for all 5 services
- Real-time response times
- Active incidents display
- 24-hour uptime visualization
- Auto-refresh every 60 seconds

---

## 📡 Monitored Services

| Service | URL | Type | Status |
|---------|-----|------|--------|
| API Gateway | api.vocalscale.com/api/health | API | ✅ |
| Authentication | supabase.co/auth/v1/health | External | ⚠️ |
| Payment Service | billing.vocalscale.com/api/health | API | ⚠️ |
| Knowledge Engine | api.vocalscale.com/knowledge/health | API | ⚠️ |
| Website | www.vocalscale.com | HTTP | ✅ |

---

## 🚀 Quick Start

### One-Command Setup

```bash
cd main-vocalscale-frontend
bash scripts/setup-status-tracker.sh
```

This will:
1. Install Python dependencies
2. Create data directories
3. Initialize status files
4. Test the agent
5. Deploy to Cloudflare

### Start Monitoring

```bash
# Run once (test)
bash scripts/manage-status-tracker.sh run

# Run as daemon (recommended)
bash scripts/manage-status-tracker.sh daemon 60

# Check status
bash scripts/manage-status-tracker.sh status

# View logs
bash scripts/manage-status-tracker.sh logs

# Stop daemon
bash scripts/manage-status-tracker.sh stop
```

---

## 📁 Architecture

```
Status Tracker System
│
├── .agent/tasks/
│   └── status-tracker-agent.py    # Main monitoring agent
│
├── scripts/
│   ├── setup-status-tracker.sh    # Setup script
│   └── manage-status-tracker.sh   # Management script
│
├── status-page/
│   ├── index.html                 # Live status page (reads JSON)
│   └── data/
│       ├── status.json           # Current status (agent writes)
│       ├── incidents.json        # Incidents history
│       ├── history.json          # Check history
│       └── rules.json            # Monitoring rules
│
└── logs/
    └── status-tracker/
        └── status-YYYYMMDD.log   # Agent logs
```

---

## 🔄 How It Works

### Agent Flow

```
1. Agent runs (every 60s)
   ↓
2. Checks all services via HTTP requests
   ↓
3. Collects real data:
   - Response time
   - Status code
   - Actual status (operational/degraded/down)
   ↓
4. Detects new incidents
   ↓
5. Updates status.json
   ↓
6. Sends Telegram alerts (if issues)
   ↓
7. Auto-deploys to Cloudflare
   ↓
8. Status page reads status.json
   ↓
9. Displays live data to visitors
   ↓
10. Repeat every 60 seconds
```

### Status Page Flow

```
1. User visits status.vocalscale.com
   ↓
2. Browser loads index.html
   ↓
3. JavaScript fetches /data/status.json
   ↓
4. Renders live data from agent
   ↓
5. Auto-refreshes every 60s
```

---

## ⚙️ Configuration

### Rules (`status-page/data/rules.json`)

```json
{
  "check_interval_seconds": 60,           // How often to check
  "timeout_seconds": 5,                   // Request timeout
  "error_threshold": 3,                   // Errors before alert
  "degraded_threshold_time_ms": 3000,     // Max response time
  "auto_deploy_on_change": true,          // Auto-deploy to Cloudflare
  "send_telegram_alerts": true,           // Send Telegram alerts
  "telegram_bot_token": "8592432107:...", // Bot token
  "telegram_chat_id": "7127690178",       // Your chat ID
  "log_incidents": true,                  // Log incidents
  "maintain_90_day_history": true         // Keep 90 days history
}
```

### To Change Rules

Edit `status-page/data/rules.json`:
```bash
nano status-page/data/rules.json
```

Changes take effect on next check.

---

## 📊 Status Data Format

### status.json (Current Status)

```json
{
  "updated": "2026-02-18T20:10:00.000Z",
  "overall_status": "operational",
  "services": [
    {
      "name": "API Gateway",
      "status": "operational",
      "response_time": 362.5,
      "status_code": 200,
      "timestamp": "2026-02-18T20:10:00.000Z",
      "message": ""
    }
  ],
  "active_incidents": []
}
```

### incidents.json (Incident History)

```json
[
  {
    "id": "INC-20260218201000-api-gateway",
    "service": "API Gateway",
    "type": "outage",
    "status": "active",
    "started_at": "2026-02-18T20:10:00.000Z",
    "ended_at": null,
    "message": "Connection timeout"
  }
]
```

---

## 🔔 Alerts

### Telegram Alerts

When new incidents occur:
- 🚨 Real-time alerts to your Telegram
- 📱 Bot: `@vocalscale_dev_bot`
- 📊 Service status and message
- 🔗 Link to status page

### Alert Triggers

- Service goes down
- Service degraded (slow response)
- Connection timeout
- Server error (5xx)

---

## 🧪 Testing

### Test the Agent

```bash
# Run single check
python3 .agent/tasks/status-tracker-agent.py

# Expected output:
# ✅ Checked 5 services
# ✅ Updated status.json
# ✅ Deployed to Cloudflare
```

### Test Status Page

```bash
# Check if status.json exists
cat status-page/data/status.json

# Test HTTP endpoint (after deploy)
curl https://devagent.vocalscale-status.pages.dev/data/status.json
```

---

## 🚀 Deployment

### Cloudflare Pages

The status page is deployed via Cloudflare Pages:

**Current URL:** https://devagent.vocalscale-status.pages.dev

**Setup Custom Domain:**

1. Go to: https://dash.cloudflare.com/
2. Navigate: Workers & Pages → vocalscale-status
3. Click: "Custom domains"
4. Click: "Set up a custom domain"
5. Enter: `status.vocalscale.com`
6. Click: "Activate domain"

**DNS Update:**
```
Type: CNAME
Name: status
Target: vocalscale-status.pages.dev
Proxy: ON
TTL: Auto
```

### Auto-Deploy

The agent auto-deploys to Cloudflare on every check. To disable:

```bash
# Edit rules.json
nano status-page/data/rules.json

# Change:
"auto_deploy_on_change": true

# To:
"auto_deploy_on_change": false
```

---

## 📅 Scheduling

### Run as Daemon

```bash
# Start daemon (check every 60 seconds)
bash scripts/manage-status-tracker.sh daemon 60

# Check if running
bash scripts/manage-status-tracker.sh status

# Stop daemon
bash scripts/manage-status-tracker.sh stop
```

### Crontab (Auto-Start)

Add to crontab for automatic startup:

```bash
# Edit crontab
crontab -e

# Add line (runs as daemon every 60 seconds):
* * * * * cd /path/to/main-vocalscale-frontend && bash scripts/manage-status-tracker.sh daemon 60
```

---

## 🔧 Troubleshooting

### Agent Not Running

```bash
# Check status
bash scripts/manage-status-tracker.sh status

# View logs
bash scripts/manage-status-tracker.sh logs

# Restart
bash scripts/manage-status-tracker.sh restart
```

### Status Page Not Updating

```bash
# Check if agent is running
bash scripts/manage-status-tracker.sh status

# Manual check
bash scripts/manage-status-tracker.sh run

# Check status.json
cat status-page/data/status.json

# Check Cloudflare deployment
cd status-page && wrangler pages deployment list --project-name=vocalscale-status
```

### Telegram Alerts Not Sending

```bash
# Check rules
cat status-page/data/rules.json

# Verify bot token and chat ID in rules.json

# Test Telegram manually
curl -X POST "https://api.telegram.org/bot8592432107:AAH43D90LhaSoZYCJAChVxASYRqnFx6eOz8/sendMessage"
  -d "chat_id=7127690178"
  -d "text=Test message"
```

---

## 📊 Dashboard Quick Links

- **Status Page:** https://status.vocalscale.com
- **Status JSON:** https://status.vocalscale.com/data/status.json
- **Incidents JSON:** https://status.vocalscale.com/data/incidents.json
- **History JSON:** https://status.vocalscale.com/data/history.json
- **Cloudflare:** https://dash.cloudflare.com/

---

## 🎯 Main LLM Control

The agent is designed to be controlled by the main LLM:

**Commands the LLM can issue:**
```python
# From main LLM to start monitoring
python3 .agent/tasks/status-tracker-agent.py

# Manage daemon
bash scripts/manage-status-tracker.sh daemon 60
bash scripts/manage-status-tracker.sh stop

# Check status
bash scripts/manage-status-tracker.sh status

# View logs
bash scripts/manage-status-tracker.sh logs

# Update rules (python)
# Edit status-page/data/rules.json
```

**Agent follows these rules:**
- Check every 60 seconds (configurable)
- Alert on new incidents
- Auto-deploy status changes
- Send Telegram notifications
- Maintain 90-day history
- Follow rules.json configuration

---

## 📝 Notes

**Real Data Collection:**
- Uses real HTTP requests (not no-cors guesses)
- Gets actual response times and status codes
- Accurate service status detection

**Incident Detection:**
- Automatically detects new incidents
- Tracks start/end times
- Maintains incident history

**Auto-Deployment:**
- Deploys to Cloudflare on every change
- Status page always shows latest data
- Global CDN for fast access

---

**Setup complete! Visit https://status.vocalscale.com 🚀**
