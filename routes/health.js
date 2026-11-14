const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

router.get("/health", async (req, res) => {
  try {
    const { error } = await supabase
      .from("medicines")
      .select("id")
      .limit(1);

    if (error) {
      console.error("Test Supabase échoué :", error.message);
      return res.status(503).json({
        success: false,
        application: "PharmaFinder",
        database: "error",
        message: "La connexion à la base de données a échoué. Vérifie les tables et les identifiants."
      });
    }

    return res.json({
      success: true,
      application: "PharmaFinder",
      database: "connected"
    });
  } catch (error) {
    console.error("Erreur /health :", error.message);
    return res.status(500).json({
      success: false,
      message: "Erreur interne pendant le test."
    });
  }
});

module.exports = router;
