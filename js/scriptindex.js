function checkLogin() {
    const isLoggedIn = false; // à remplacer par un vrai check plus tard
    if (!isLoggedIn) {
      alert("Veuillez vous connecter pour activer la géolocalisation.");
      window.location.href = "connexion.html";
    } else {
      // Logique de géolocalisation ici
      navigator.geolocation.getCurrentPosition(
        (position) => {
          console.log(position.coords.latitude, position.coords.longitude);
        },
        () => {
          alert("Impossible de vous localiser.");
        }
      );
    }
  }
  