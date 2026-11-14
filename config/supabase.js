const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error("Variables SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY obligatoires.");
}

// Ce client est réservé au serveur. Ne jamais exposer la clé service_role au navigateur.
const supabase = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false
  }
});

module.exports = supabase;
