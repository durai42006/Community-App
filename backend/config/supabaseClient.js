import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("❌ Supabase environment variables are missing!");
  process.exit(1);
}

// ✅ Use named export instead of default
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
