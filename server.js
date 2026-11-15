require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const path = require("path");
const supabase = require("./config/supabase");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.disable("x-powered-by");

// Sécurité HTTP
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

// Lecture des données
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// Limitation des requêtes
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
app.use("/api", require("./routes/health"));
app.use("/api/inscription", require("./routes/inscription"));

// Fichiers publics
app.use(express.static(path.join(__dirname, "public")));

// Vérification du serveur et de Supabase
app.get("/api/health", async (req, res) => {
  try {
    const { error } = await supabase
      .from("pharmacies")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Erreur Supabase :", error.message);

      return res.status(503).json({
        success: false,
        message: "Base de données indisponible."
      });
    }

    return res.json({
      success: true,
      application: "PharmaFinder Cameroun",
      database: "connected"
    });

  } catch (error) {
    console.error("Erreur santé :", error.message);

    return res.status(500).json({
      success: false,
      message: "Erreur interne."
    });
  }
});

// Recherche de pharmacies par nom et ville
app.get("/api/pharmacies", async (req, res) => {
  try {
    const name = String(req.query.name || "").trim();
    const city = String(req.query.city || "").trim();

    if (name.length > 100 || city.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Recherche trop longue."
      });
    }

    let query = supabase
      .from("pharmacies")
      .select("id, name, address, city, phone, latitude, longitude")
      .eq("status", "approved")
      .limit(50);

    if (name) {
      query = query.ilike("name", %${name}%);
    }

    if (city) {
      query = query.ilike("city", %${city}%);
    }

    const { data, error } = await query;

    if (error) throw error;

    return res.json({
      success: true,
      pharmacies: data || []
    });

  } catch (error) {
    console.error("Recherche pharmacies :", error.message);

    return res.status(500).json({
      success: false,
      message: "Impossible de rechercher les pharmacies."
    });
  }
});

// Recherche des pharmacies proches
app.get("/api/pharmacies/nearby", async (req, res) => {
  try {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: "Coordonnées GPS invalides."
      });
    }

    const { data, error } = await supabase
      .from("pharmacies")
      .select("id, name, address, city, phone, latitude, longitude")
      .eq("status", "approved")
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .limit(500);

    if (error) throw error;

    const pharmacies = (data || [])
      .map(pharmacy => {
        const lat = Number(pharmacy.latitude);
        const lon = Number(pharmacy.longitude);
        const distance = 6371 * 2 * Math.asin(
          Math.sqrt(
            Math.sin((lat - latitude) * Math.PI / 360) ** 2 +
            Math.cos(latitude * Math.PI / 180) *
            Math.cos(lat * Math.PI / 180) *
            Math.sin((lon - longitude) * Math.PI / 360) ** 2
          )
        );

        return {
          ...pharmacy,
          distance: Math.round(distance * 10) / 10
        };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 30);

    return res.json({
      success: true,
      pharmacies
    });

  } catch (error) {
    console.error("Recherche proximité :", error.message);

    return res.status(500).json({
      success: false,
      message: "Impossible de rechercher les pharmacies proches."
    });
  }
});

// Page d'accueil
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API inconnue
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



