export const env = {
  API_URL: import.meta.env.VITE_API_URL || "https://api.vocalscale.com/api",
  PAYMENT_API_URL: import.meta.env.VITE_PAYMENT_API_URL || "https://billing.vocalscale.com/api",
  POSTHOG_KEY: import.meta.env.VITE_POSTHOG_KEY || "",
  POSTHOG_HOST: import.meta.env.VITE_POSTHOG_HOST || "https://us.i.posthog.com",
};
