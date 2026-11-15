const form = document.getElementById("login-form");
const button = document.getElementById("login-button");
const message = document.getElementById("login-message");

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  message.textContent = "";
  button.disabled = true;
  button.textContent = "Connexion en cours...";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Connexion impossible.");
    }

    if (!data.session || !data.session.access_token) {
      throw new Error("La session n'a pas été reçue.");
    }

    localStorage.setItem(
      "pharmafinder_access_token",
      data.session.access_token
    );

    message.textContent = "Connexion réussie ! Redirection...";
    message.style.color = "green";

    window.location.href = "/";

  } catch (error) {
    message.textContent = error.message;
    message.style.color = "red";
  } finally {
    button.disabled = false;
    button.textContent = "Se connecter";
  }
});
