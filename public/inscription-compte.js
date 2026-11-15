const form = document.getElementById("account-form");
const button = document.getElementById("account-button");
const message = document.getElementById("account-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const fullName = document
    .getElementById("full-name")
    .value.trim();

  const email = document
    .getElementById("account-email")
    .value.trim();

  const password = document
    .getElementById("account-password")
    .value;

  const confirmPassword = document
    .getElementById("confirm-password")
    .value;

  message.textContent = "";

  if (fullName.length < 2) {
    message.textContent = "Veuillez saisir votre nom complet.";
    return;
  }

  if (password.length < 8) {
    message.textContent = "Le mot de passe doit contenir au moins 8 caractères.";
    return;
  }

  if (password !== confirmPassword) {
    message.textContent = "Les mots de passe ne correspondent pas.";
    return;
  }

  button.disabled = true;
  button.textContent = "Création du compte...";

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        full_name: fullName,
        email,
        password
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Impossible de créer le compte."
      );
    }

    message.style.color = "green";
    message.textContent =
      data.message || "Compte créé. Vérifiez votre adresse e-mail si nécessaire.";

    form.reset();

  } catch (error) {
    message.style.color = "red";
    message.textContent = error.message;
  } finally {
    button.disabled = false;
    button.textContent = "Créer mon compte";
  }
});
