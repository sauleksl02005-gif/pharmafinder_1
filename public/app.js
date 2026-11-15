async function checkServer() {
  const statusText = document.getElementById("server-status");
  const indicator = document.getElementById("status-indicator");

  try {
    const response = await fetch("/api/health", {
      headers: { Accept: "application/json" }
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Connexion indisponible");
    }

    statusText.textContent =
      "Le serveur Node.js et la base Supabase communiquent correctement.";

    indicator.textContent = "Connecté";
    indicator.className = "status-indicator ok";

  } catch (error) {
    statusText.textContent =
      "Connexion non vérifiée. Vérifie Render et Supabase.";

    indicator.textContent = "À vérifier";
    indicator.className = "status-indicator error";
  }
}


// Recherche des pharmacies
async function searchPharmacies(name = "", city = "") {
  const results = document.getElementById("pharmacy-results");
  const message = document.getElementById("search-message");
  const button = document.getElementById("search-button");

  results.innerHTML = "<p>Recherche en cours...</p>";
  message.textContent = "";

  if (button) button.disabled = true;

  try {
    const params = new URLSearchParams();

    if (name.trim()) params.set("name", name.trim());
    if (city.trim()) params.set("city", city.trim());

    const response = await fetch(
      "/api/pharmacies?" + params.toString(),
      { headers: { Accept: "application/json" } }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Impossible de charger les pharmacies.");
    }

    displayPharmacies(data.pharmacies || []);

    message.textContent =
      (data.pharmacies || []).length + " pharmacie(s) trouvée(s).";

  } catch (error) {
    results.innerHTML = 
      <div class="empty-state">
        <h3>Recherche indisponible</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    ;

    message.textContent = "Une erreur est survenue.";
  } finally {
    if (button) button.disabled = false;
  }
}


// Protection de l'affichage HTML
function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]);
}


// Affichage des pharmacies
function displayPharmacies(pharmacies) {
  const results = document.getElementById("pharmacy-results");

  if (!pharmacies.length) {
    results.innerHTML = 
      <div class="empty-state">
        <div class="empty-icon">⌕</div>
        <h3>Aucune pharmacie trouvée</h3>
        <p>Essaie un autre nom, une autre ville ou un autre quartier.</p>
      </div>
    ;
    return;
  }

  results.innerHTML = pharmacies.map(pharmacy => {
    const phone = String(pharmacy.phone || "").replace(/[^\d+]/g, "");

    return 
      <article class="pharmacy-card">
        <div class="pharmacy-card-icon">✚</div>

        <div class="pharmacy-card-content">
          <h3>${escapeHTML(pharmacy.name)}</h3>

          <p>
            <strong>Adresse :</strong>
            ${escapeHTML(pharmacy.address || "Non renseignée")}
          </p>

          <p>
            <strong>Ville :</strong>
            ${escapeHTML(pharmacy.city || "Non renseignée")}
          </p>

          <p>
            <strong>Téléphone :</strong>
            ${escapeHTML(pharmacy.phone || "Non renseigné")}
          </p>

          ${phone ? 
            <a class="contact-button"
               href="tel:${escapeHTML(phone)}">
              Contacter la pharmacie
            </a>
           : ""}
        </div>
      </article>
    ;
  }).join("");
}


// Formulaire de recherche
document.getElementById("search-form")?.addEventListener("submit", event => {
  event.preventDefault();

  const name = document.getElementById("pharmacy-search").value;
  const city = document.getElementById("city-search").value;

  searchPharmacies(name, city);
});
// Recherche à proximité avec autorisation GPS
document.getElementById("location-button")?.addEventListener("click", () => {
  const message = document.getElementById("search-message");

  if (!navigator.geolocation) {
    message.textContent = "La géolocalisation n'est pas disponible.";
    return;
  }

  message.textContent = "Recherche de votre position...";

  navigator.geolocation.getCurrentPosition(
    position => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      searchNearbyPharmacies(latitude, longitude);
    },
    () => {
      message.textContent =
        "Position non accessible. Autorise la géolocalisation dans ton navigateur.";
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});


// Recherche des pharmacies proches
async function searchNearbyPharmacies(latitude, longitude) {
  const results = document.getElementById("pharmacy-results");
  const message = document.getElementById("search-message");

  results.innerHTML = "<p>Recherche des pharmacies à proximité...</p>";

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude)
    });

    const response = await fetch(
      "/api/pharmacies/nearby?" + params.toString(),
      { headers: { Accept: "application/json" } }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Recherche à proximité indisponible.");
    }

    displayPharmacies(data.pharmacies || []);
    message.textContent =
      (data.pharmacies || []).length + " pharmacie(s) proche(s) trouvée(s).";

  } catch (error) {
    results.innerHTML = 
      <div class="empty-state">
        <h3>Recherche impossible</h3>
        <p>${escapeHTML(error.message)}</p>
      </div>
    ;
    message.textContent = "Vérifie la connexion au serveur.";
  }
}


// Démarrage
checkServer();
