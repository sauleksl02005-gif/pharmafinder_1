const express = require("express");
const router = express.Router();
const supabase = require("../config/supabase");

// Recherche des pharmacies par nom et ville
router.get("/", async (req, res) => {
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
    console.error("Erreur recherche pharmacies :", error.message);

    return res.status(500).json({
      success: false,
      message: "Impossible de rechercher les pharmacies."
    });
  }
});


// Recherche des pharmacies à proximité
router.get("/nearby", async (req, res) => {
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
    console.error("Erreur recherche GPS :", error.message);

    return res.status(500).json({
      success: false,
      message: "Impossible de rechercher les pharmacies proches."
    });
  }
});

module.exports = router;
