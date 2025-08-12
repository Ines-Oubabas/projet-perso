/* ===========================
   NAVBAR : lien actif + pseudo-auth
=========================== */
(function () {
  // Activer le lien courant
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll('.nav-list a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.setAttribute('aria-current', 'page');
  });

  // Pseudo-auth depuis localStorage
  const user = JSON.parse(localStorage.getItem('wanderia:user') || 'null');
  const authBtn = document.getElementById('authBtn');
  if (authBtn) {
    if (user?.name) {
      authBtn.textContent = `👋 ${user.name}`;
      authBtn.href = 'profil.html';
      authBtn.setAttribute('title', 'Accéder à votre profil');
    } else {
      authBtn.textContent = 'Connexion';
      authBtn.href = 'connexion.html';
    }
  }
})();

/* ===========================
   Bouton "Explorer autour de moi"
=========================== */
window.checkLogin = function checkLogin () {
  // Si pas de "login", on peut soit rediriger vers connexion, soit lancer la geo directe.
  // Ici on lance la géoloc si la page possède une carte, sinon on va vers les destinations.
  const mapEl = document.getElementById('map');
  if (mapEl) {
    getLocation();
  } else {
    location.href = 'lieux.html';
  }
};

/* ===========================
   Géolocalisation + Leaflet
=========================== */
let map;

window.getLocation = function getLocation () {
  if (!navigator.geolocation) {
    const res = document.getElementById("result");
    if (res) res.innerText = "Géolocalisation non supportée.";
    alert("Géolocalisation non supportée par votre navigateur.");
    return;
  }
  navigator.geolocation.getCurrentPosition(showPosition, showError);
};

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  const res = document.getElementById("result");
  if (res) res.innerText = `Latitude: ${lat} - Longitude: ${lon}`;

  // Si pas d'élément #map sur la page, on sort proprement
  const mapContainer = document.getElementById("map");
  if (!mapContainer) return;

  // Vérifier que Leaflet est bien chargé
  if (typeof L === "undefined") {
    console.warn("Leaflet (L) non chargé sur cette page.");
    return;
  }

  map = L.map("map").setView([lat, lon], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  }).addTo(map);

  L.marker([lat, lon]).addTo(map)
    .bindPopup("Vous êtes ici.")
    .openPopup();

  fetch("js/lieux.json")
    .then(response => response.json())
    .then(data => {
      data.forEach(lieu => {
        if (typeof lieu.latitude !== "number" || typeof lieu.longitude !== "number") return;
        L.marker([lieu.latitude, lieu.longitude])
          .addTo(map)
          .bindPopup(`<strong>${lieu.nom}</strong><br>${lieu.description || ""}`);
      });
    })
    .catch(error => console.error("Erreur chargement lieux :", error));
}

function showError(error) {
  const res = document.getElementById("result");
  let msg = "Erreur inconnue.";
  switch (error.code) {
    case error.PERMISSION_DENIED:    msg = "Géolocalisation refusée."; break;
    case error.POSITION_UNAVAILABLE: msg = "Position non disponible."; break;
    case error.TIMEOUT:              msg = "Temps de réponse expiré."; break;
  }
  if (res) res.innerText = msg;
  alert(msg);
}
