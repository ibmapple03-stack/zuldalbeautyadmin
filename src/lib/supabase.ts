import { createClient } from "@supabase/supabase-js";

// Hardcoded directly (same approach as the CleanerPlace dashboard) instead of
// relying on Vercel environment variables. The "anon" / "publishable" key is
// safe to expose in browser code by design — real access control happens via
// Row Level Security policies in the database, not by keeping this key secret.
const SUPABASE_URL = "https://lvwarcylwiixiywkerxt.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2d2FyY3lsd2lpeGl5d2tlcnh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxNTc5NTYsImV4cCI6MjA5ODczMzk1Nn0.VBSlyEysOrSIXO7zu2NbTljGIp6FNlL6WLOvNnTrbdg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
