/* js/script.js
   - Onglets Login / Register (un seul formulaire visible à la fois)
   - Mock d'authentification (localStorage) + redirection vers profil
*/

// ----- Sélecteurs -----
const loginTab = document.getElementById("loginTab");
const registerTab = document.getElementById("registerTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");

// Champs login
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

// Champs register
const regName = document.getElementById("regName");
const regEmail = document.getElementById("regEmail");
const regPassword = document.getElementById("regPassword");
const regConfirm = document.getElementById("regConfirm");

// ----- Helper: activer un onglet -----
function setActiveTab(which) {
  const showLogin = which === "login";

  // classes
  loginTab?.classList.toggle("active", showLogin);
  registerTab?.classList.toggle("active", !showLogin);
  loginForm?.classList.toggle("active", showLogin);
  registerForm?.classList.toggle("active", !showLogin);

  // accessibilité (facultatif mais propre)
  loginTab?.setAttribute("aria-selected", String(showLogin));
  registerTab?.setAttribute("aria-selected", String(!showLogin));

  // focus premier champ
  if (showLogin) {
    loginEmail?.focus();
  } else {
    regName?.focus();
  }
}

// ----- Événements onglets -----
if (loginTab && registerTab && loginForm && registerForm) {
  loginTab.addEventListener("click", () => setActiveTab("login"));
  registerTab.addEventListener("click", () => setActiveTab("register"));

  // État initial : si URL contient #register on affiche inscription
  if (location.hash.replace("#", "") === "register") {
    setActiveTab("register");
  } else {
    setActiveTab("login");
  }
}

// ----- Pseudo-auth: sauver l'utilisateur et rediriger -----
function saveUserAndGo(name, email) {
  const cleanName = (name || "Voyageur").trim();
  const cleanEmail = (email || "").trim();
  const user = { name: cleanName, email: cleanEmail };

  try {
    localStorage.setItem("wanderia:user", JSON.stringify(user));
  } catch (e) {
    console.warn("Impossible d'écrire dans localStorage:", e);
  }
  window.location.href = "profil.html";
}

// ----- Login submit -----
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = (loginEmail?.value || "").trim();
    // Nom déduit de l’email si possible
    let guessName = "Voyageur";
    if (email.includes("@")) {
      const raw = email.split("@")[0];
      guessName = raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "Voyageur";
    }
    // (mot de passe ignoré - mock)
    saveUserAndGo(guessName, email);
  });
}

// ----- Register submit -----
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (regName?.value || "").trim();
    const email = (regEmail?.value || "").trim();
    const pass = regPassword?.value || "";
    const conf = regConfirm?.value || "";

    if (!name) { alert("Merci d’indiquer votre nom."); return; }
    if (!email) { alert("Merci d’indiquer votre email."); return; }
    if (!pass || !conf) { alert("Merci de renseigner et confirmer le mot de passe."); return; }
    if (pass !== conf) { alert("Les mots de passe ne correspondent pas."); return; }

    saveUserAndGo(name, email);
  });
}

// ----- Petits plus: empêcher les boutons sociaux de soumettre le formulaire -----
document.querySelectorAll(".social").forEach(btn => {
  btn.addEventListener("click", (e) => e.preventDefault());
});
