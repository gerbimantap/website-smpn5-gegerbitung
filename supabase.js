import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const configured = !SUPABASE_URL.includes("YOUR-PROJECT") && !SUPABASE_ANON_KEY.includes("YOUR_");

// Memuat fitur "Lihat selengkapnya" Program Unggulan tanpa mengubah index.html.
if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("achievementGrid")) {
      setTimeout(() => import("./program-unggulan-fix.js?v=20260910-1"), 1800);
    }
  });
}
