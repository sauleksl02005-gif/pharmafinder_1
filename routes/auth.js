const express = require("express");
const router = express.Router();
const { createClient } = require("@supabase/supabase-js");

// Client Supabase Auth : utilise uniquement la clé publique anon.
const authClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim();
    const password = String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Veuillez renseigner votre e-mail et votre mot de passe."
      });
    }

    if (email.length > 254 || password.length > 128) {
      return res.status(400).json({
        success: false,
        message: "Les informations fournies sont invalides."
      });
    }

    const { data, error } =
      await authClient.auth.signInWithPassword({
        email,
        password
      });

    if (error || !data.session) {
      return res.status(401).json({
        success: false,
        message: "E-mail ou mot de passe incorrect."
      });
    }

    return res.json({
      success: true,
      message: "Connexion réussie.",
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    });

  } catch (error) {
    console.error("Erreur de connexion :", error.message);

    return res.status(500).json({
      success: false,
      message: "Une erreur serveur est survenue."
    });
  }
});

module.exports = router;
