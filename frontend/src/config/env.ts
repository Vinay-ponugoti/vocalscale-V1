export const env = {
  API_URL: import.meta.env.VITE_API_URL || "https://api.vocalscale.com/api",
  PAYMENT_API_URL: import.meta.env.VITE_PAYMENT_API_URL || "https://billing.vocalscale.com/api",
  KNOWLEDGE_API_URL: import.meta.env.VITE_KNOWLEDGE_API_URL || "https://knowledge.vocalscale.com",
};
