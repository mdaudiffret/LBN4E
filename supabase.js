/* global supabase */

// ── Configuration Supabase ─────────────────────────────────────────
// 1. Créer un projet sur https://supabase.com
// 2. Dashboard → Settings → API
// 3. Copier Project URL et anon public key ci-dessous
// 4. Lancer migration.sql dans Dashboard → SQL Editor

const SUPABASE_URL      = "https://nrwdqknjlsanuaenrbor.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5yd2Rxa25qbHNhbnVhZW5yYm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0OTQ1NjMsImV4cCI6MjA5NDA3MDU2M30.sO9bIFePWLfKhsOR3nO49I4f4KBVJ10_CXv_BwFJ5ac";

window.__supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
