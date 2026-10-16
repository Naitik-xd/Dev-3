// src/api/health.ts
async function handler(req, res) {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store, max-age=0");
  return res.json({
    status: "ok",
    version: "1.0.0-beta",
    model: "gemma-4-26b-a4b-it",
    availableFamily: "Gemma (Gemma 4 priority, Gemma 2 fallback)",
    models: ["gemma-4-26b-a4b-it", "gemma-4-31b-it", "gemma-2-27b-it", "gemma-2-9b-it"],
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
}
export {
  handler as default
};
