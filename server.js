require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

const app = express();
const PORT = Number(process.env.PORT || 3000);

// Vérification de la configuration
if (
  !process.env.SUPABASE_URL ||
  !process.env.SUPABASE_SERVICE_ROLE_KEY
) {
  console.error(
    "Configuration manquante : SUPABASE_URL et/ou SUPABASE_SERVICE_ROLE_KEY."
  );
  process.exit(1);
}

// Connexion Supabase côté serveur uniquement
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://*.supabase.co"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: null
      }
    }
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Trop de requêtes. Réessaie plus tard."
  }
});

app.use("/api", apiLimiter);

// Fichiers publics
app.use(express.static(path.join(__dirname, "public")));

// Routes de santé
app.use("/api", require("./routes/health"));

// Page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Route API inconnue
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route API introuvable."
  });
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error("Erreur serveur :", err.message);

  res.status(500).json({
    success: false,
    message: "Une erreur interne est survenue."
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(PharmaFinder démarré sur le port ${PORT});
});
