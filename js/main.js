let map;

function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    document.getElementById("result").innerText = "Géolocalisation non supportée.";
  }
}

function showPosition(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;

  document.getElementById("result").innerText = `Latitude: ${lat} - Longitude: ${lon}`;

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
        L.marker([lieu.latitude, lieu.longitude])
          .addTo(map)
          .bindPopup(`<strong>${lieu.nom}</strong><br>${lieu.description}`);
      });
    })
    .catch(error => console.error("Erreur chargement lieux :", error));
}

function showError(error) {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      alert("Géolocalisation refusée.");
      break;
    case error.POSITION_UNAVAILABLE:
      alert("Position non disponible.");
      break;
    case error.TIMEOUT:
      alert("Temps de réponse expiré.");
      break;
    default:
      alert("Erreur inconnue.");
  }
}
