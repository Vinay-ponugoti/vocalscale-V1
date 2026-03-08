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
    csp += ` script-src 'self' 'unsafe-inline'${isDev ? ' \'unsafe-eval\'' : ''} https://challenges.cloudflare.com https://static.cloudflareinsights.com https://www.clarity.ms https://scripts.clarity.ms https://www.googletagmanager.com https://www.google-analytics.com;`;
    csp += ` style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;`;
    csp += ` img-src 'self' data: blob: https://c.bing.com https://*.google-analytics.com https://*.supabase.co https://*.googleapis.com https://*.googleusercontent.com;`;
    csp += ` media-src 'self' data: https://*.r2.dev https://api.vocalscale.com;`;
    // Always include the known production API origins; extend with env-var for extras
    const prodOrigins = `'self' https://api.vocalscale.com https://billing.vocalscale.com https://knowledge.vocalscale.com https://*.supabase.co https://static.cloudflareinsights.com https://challenges.cloudflare.com https://*.clarity.ms https://c.bing.com https://www.google-analytics.com https://formsubmit.co`;
    const extraOrigins = allowedOrigins !== 'self' ? ` ${allowedOrigins}` : '';
    csp += ` connect-src ${prodOrigins}${extraOrigins} ${isDev || allowInternet ? 'https:' : ''} wss:;`;
    csp += ` font-src 'self' https://fonts.gstatic.com;`;
    csp += ` frame-src 'self' https://challenges.cloudflare.com;`;

    return csp;
  };

  return {
    plugins: [
      react(),
      {
        name: 'html-inject',
        transformIndexHtml: (html) => {
          // Get environment variables
          const gaId = process.env.VITE_GA_TRACKING_ID || '';
          const clarityId = process.env.VITE_CLARITY_PROJECT_ID || '';
          const csp = buildCSP();

          // Use global regex so ALL occurrences of the nonce placeholder are replaced
          // (Clarity script + GA script both use %%VITE_CSP_NONCE%%)
          return html
            .replace('%%VITE_GA_TRACKING_ID%%', gaId)
            .replace('%%VITE_CLARITY_PROJECT_ID%%', clarityId)
            .replace('%%VITE_CSP%%', csp)
            .replace(/%%VITE_CSP_NONCE%%/g, '');
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
