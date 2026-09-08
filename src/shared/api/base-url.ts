/** Empty in dev → same-origin + Vite proxy (no CORS). Absolute URL only if you need direct API access. */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
