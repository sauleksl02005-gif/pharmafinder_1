async function checkServer() {
  const statusText = document.getElementById("server-status");
  const indicator = document.getElementById("status-indicator");

  try {
    const response = await fetch("/api/health", { headers: { "Accept": "application/json" } });
    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Connexion indisponible");
    }

    statusText.textContent = "Le serveur Node.js et la base Supabase communiquent correctement.";
    indicator.textContent = "Connecté";
    indicator.className = "status-indicator ok";
  } catch (error) {
    statusText.textContent = "Connexion non vérifiée. Vérifie les variables d'environnement et la base Supabase.";
    indicator.textContent = "À vérifier";
    indicator.className = "status-indicator error";
  }
}

checkServer();
