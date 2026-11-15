const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Inscription d'une pharmacie
router.post("/pharmacie", async (req, res) => {
  try {
    const {
      owner_id,
      name,
      address,
      city,
      phone,
      email,
      latitude,
      longitude
    } = req.body;

    // Vérification des informations
    if (
      !owner_id ||
      !name ||
      !address ||
      !city ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: "Tous les champs obligatoires doivent être remplis."
      });
    }

    if (
      String(name).length > 150 ||
      String(address).length > 250 ||
      String(city).length > 100 ||
      String(phone).length > 30
    ) {
      return res.status(400).json({
        success: false,
        message: "Certaines informations sont trop longues."
      });
    }

    // Vérification de l'utilisateur authentifié
    // Cette route doit être complétée par le contrôle du jeton
    // Supabase Auth avant toute utilisation en production.
    return res.status(501).json({
      success: false,
      message: "L'authentification doit être configurée avant l'inscription."
    });

  } catch (error) {
    console.error("Erreur inscription :", error.message);

    return res.status(500).json({
      success: false,
      message: "Erreur pendant l'inscription."
    });
  }
});

module.exports = router;
