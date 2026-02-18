import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';

  // Build CSP based on environment
  const buildCSP = () => {
    const allowedOrigins = process.env.VITE_API_ALLOWED_ORIGINS || 'self';
    const allowInternet = process.env.VITE_ALLOW_INTERNET_CONNECT === 'true';

    // Common CSP directives
    let csp = `default-src 'self';`;
    csp += ` script-src 'self'${isDev ? ' \'unsafe-eval\'' : ''} 'nonce-%%VITE_CSP_NONCE%%' https://challenges.cloudflare.com https://www.clarity.ms https://scripts.clarity.ms https://www.googletagmanager.com https://www.google-analytics.com;`;
    csp += ` style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`;
    csp += ` img-src 'self' data: blob: https://c.bing.com https://*.google-analytics.com;`;
    csp += ` media-src 'self' data: https://*.r2.dev https://api.vocalscale.com;`;
    csp += ` connect-src ${allowedOrigins} ${isDev || allowInternet ? 'https:' : ''} wss:;`;
    csp += ` font-src 'self' https://fonts.gstatic.com;`;
    csp += ` frame-ancestors 'none';`;

    return csp;
  };

  return {
    plugins: [
      react(),
      {
        name: 'html-inject',
        transformIndexHtml: (html, { server }) => {
          // Generate nonce for CSP
          const nonce = Math.random().toString(36).substring(2, 10);
          // Get environment variables
          const gaId = process.env.VITE_GA_TRACKING_ID || '';
          const clarityId = process.env.VITE_CLARITY_PROJECT_ID || '';
          const csp = buildCSP().replace('%%VITE_CSP_NONCE%%', nonce);

          return html
            .replace('%%VITE_GA_TRACKING_ID%%', gaId)
            .replace('%%VITE_CLARITY_PROJECT_ID%%', clarityId)
            .replace('%%VITE_CSP%%', csp)
            .replace('%%VITE_CSP_NONCE%%', nonce);
        },
      },
    ],
    server: {
      port: 5173,
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'date-fns'],
            ui: ['lucide-react', 'clsx', 'tailwind-merge'],
            supabase: ['@supabase/supabase-js'],
            motion: ['framer-motion'],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      // Make isDev available in client code
      __IS_DEV__: isDev,
    },
  };
});
