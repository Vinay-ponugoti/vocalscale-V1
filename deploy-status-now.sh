#!/bin/bash

echo "🚀 Deploying VocalScale Status Page to Cloudflare Pages"
echo ""

# Install wrangler
echo "📦 Installing Cloudflare CLI (wrangler)..."
npm install -g wrangler

if [ $? -ne 0 ]; then
    echo "❌ Failed to install wrangler"
    exit 1
fi

echo "✅ wrangler installed"
echo ""

# Check version
echo "📋 wrangler version:"
wrangler --version
echo ""

# Go to status page directory
cd status-page

echo "📄 Files to deploy:"
ls -lh index.html
echo ""

echo "🌐 Ready to deploy to Cloudflare Pages"
echo ""
echo "📝 IMPORTANT: You need to:"
echo "   1. Run this script"
echo "   2. When prompted, click the link to authorize"
echo "   3. Complete the Cloudflare authorization in browser"
echo ""
echo "🚀 Starting deployment..."
echo ""

# Deploy
wrangler pages deploy . --project-name=vocalscale-status

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOYMENT SUCCESSFUL!"
    echo ""
    echo "🎯 Your status page is live at:"
    echo "   https://vocalscale-status.pages.dev"
    echo ""
    echo "📊 Visit the page to see real-time status monitoring"
    echo ""
    echo "🧪 Test it:"
    echo "   curl https://vocalscale-status.pages.dev"
    echo ""
else
    echo ""
    echo "⚠️ Deployment may have failed. Check the output above."
    echo ""
    echo "Common fixes:"
    echo "   1. Make sure you authorized the Cloudflare app"
    echo "   2. Check your internet connection"
    echo "   3. Verify your Cloudflare account"
fi
