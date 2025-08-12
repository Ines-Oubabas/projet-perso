// js/destinations.js
// Cartes 3D + filtres + fiche lieu (modal) + avis/notes en localStorage

const STORAGE_AVIS = "wanderia:avis"; // { [idLieu]: [{user, note, texte, date}] }
const DEFAULT_USER = () => {
  const u = JSON.parse(localStorage.getItem("wanderia:user") || "null");
  return u?.name || "Voyageur";
};

// Utilitaires ---------------------------------------------------------------

const slug = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

function starsHTML(note, size = 18) {
  const full = Math.floor(note);
  const half = note - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '<div class="stars" aria-label="Note ' +
    note.toFixed(1) +
    '/5">' +
    "★".repeat(full) +
    (half ? "☆" : "") +
    "✩".repeat(empty) +
    ` <small>(${note.toFixed(1)})</small>` +
    "</div>"
  ).replaceAll(/★|☆|✩/g, (m) => {
    const cls = m === "★" ? "star full" : m === "☆" ? "star half" : "star";
    return `<span class="${cls}" style="font-size:${size}px"></span>`;
  });
}

// Lecture/écriture avis (local) --------------------------------------------

function getAvisLocaux(id) {
  const all = JSON.parse(localStorage.getItem(STORAGE_AVIS) || "{}");
  return Array.isArray(all[id]) ? all[id] : [];
}
function pushAvisLocal(id, avis) {
  const all = JSON.parse(localStorage.getItem(STORAGE_AVIS) || "{}");
  all[id] = [...(all[id] || []), avis];
  localStorage.setItem(STORAGE_AVIS, JSON.stringify(all));
}

// Rendu filtres -------------------------------------------------------------

function renderFilters(container, items) {
  if (!container) return;

  const cats = new Set(["Tous"]);
  items.forEach((d) => (d.categories || []).forEach((c) => cats.add(c)));
  const pills = [...cats].map(
    (c, i) =>
      `<button class="filter-pill${i === 0 ? " active" : ""}" data-type="${
        c === "Tous" ? "all" : c
      }">${c}</button>`
  );
  container.innerHTML = pills.join("");
}

// Carte (tu peux styliser avec .card en CSS) --------------------------------

function cardHTML(d) {
  const type = d.categories?.[0] || "Ville";
  const note = Number(d.noteMoy || 0);
  return `
    <article class="card tilt3d" data-id="${d.id}" data-type="${type}">
      <div class="card__media">
        <img loading="lazy" src="${d.cover}" alt="${d.nom}">
        <span class="card__badge">${type}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${d.nom}</h3>
        <p class="card__desc">${d.resume || d.description || ""}</p>
        <div class="card__row">
          <small>📍 ${d.ville || ""}${d.ville && d.pays ? ", " : ""}${d.pays || ""}</small>
          <small>⭐ ${note.toFixed(1)} • ${d.avis?.length ?? 0} avis</small>
        </div>
        <div class="card__row">
          <small>📌 ${Number(d.latitude).toFixed(3)}, ${Number(d.longitude).toFixed(3)}</small>
          <button class="card__btn open-modal" data-id="${d.id}">Détails</button>
        </div>
      </div>
    </article>
  `;
}

// Fiche (modal) -------------------------------------------------------------

function modalHTML(d, avisLocaux) {
  const avisAll = [...(d.avis || []), ...avisLocaux];
  const note =
    avisAll.length > 0
      ? avisAll.reduce((s, a) => s + Number(a.note || 0), 0) / avisAll.length
      : Number(d.noteMoy || 0);

  const tags = (d.tags || []).map((t) => `<span class="tag">${t}</span>`).join("");
  const prox =
    d.proximite?.length
      ? d.proximite
          .map(
            (p) =>
              `<li><strong>${p.type}</strong> • ${p.nom} <small>(${p.distance_m} m)</small></li>`
          )
          .join("")
      : "<li>Aucune donnée</li>";

  const avisHTML =
    avisAll.length === 0
      ? '<p class="muted">Pas encore d’avis. Soyez le premier !</p>'
      : avisAll
          .map(
            (a) => `
        <div class="review">
          <div class="review__head">
            <strong>${a.user || "Voyageur"}</strong>
            <span class="review__stars">${"★".repeat(a.note)}${"☆".repeat(
              5 - a.note
            )}</span>
          </div>
          <p>${a.texte || ""}</p>
          <small class="muted">${a.date || ""}</small>
        </div>`
          )
          .join("");

  const galerie =
    d.galerie?.length > 1
      ? `<div class="gallery">${d.galerie
          .map((g) => `<img src="${g}" alt="${d.nom}">`)
          .join("")}</div>`
      : "";

  return `
  <div class="modal__overlay">
    <div class="modal">
      <button class="modal__close" aria-label="Fermer">×</button>

      <div class="modal__media">
        <img src="${d.cover}" alt="${d.nom}">
        ${d.categories?.[0] ? `<span class="card__badge">${d.categories[0]}</span>` : ""}
      </div>

      <div class="modal__content">
        <header class="modal__header">
          <h3>${d.nom}</h3>
          ${starsHTML(note, 16)}
        </header>

        <p class="muted">${d.resume || d.description || ""}</p>

        <ul class="meta">
          <li><strong>Ville</strong> : ${d.ville || "-"}</li>
          <li><strong>Pays</strong> : ${d.pays || "-"}</li>
          <li><strong>Ouvert</strong> : ${d.ouvert || "-"}</li>
          <li><strong>Durée</strong> : ${d.duree || "-"}</li>
          <li><strong>Tarif</strong> : ${d.prix || "-"}</li>
        </ul>

        ${tags ? `<div class="tags">${tags}</div>` : ""}

        ${galerie}

        <details class="box">
          <summary>À proximité</summary>
          <ul class="list">${prox}</ul>
        </details>

        <section class="box">
          <h4 style="margin:0 0 8px;">Avis</h4>
          <div class="reviews">${avisHTML}</div>
          <form class="review-form" data-id="${d.id}">
            <label>Votre note</label>
            <div class="rate" role="radiogroup" aria-label="Note sur 5">
              ${[5,4,3,2,1]
                .map(
                  (n) => `
              <input type="radio" id="r${n}" name="rate" value="${n}">
              <label for="r${n}" title="${n} étoiles">★</label>`
                )
                .join("")}
            </div>
            <textarea name="comment" rows="3" placeholder="Partagez votre expérience..."></textarea>
            <button type="submit" class="btn-pill">Publier</button>
          </form>
        </section>

        <div class="modal__footer">
          <button class="btn-pill ghost open-map" data-lat="${d.latitude}" data-lng="${d.longitude}">
            Voir sur la carte
          </button>
          <button class="btn-pill add-fav" data-id="${d.id}">Ajouter aux favoris</button>
        </div>
      </div>
    </div>
  </div>`;
}

function openModal(d) {
  const avisLocaux = getAvisLocaux(d.id);
  const html = modalHTML(d, avisLocaux);
  document.body.insertAdjacentHTML("beforeend", html);

  const overlay = document.querySelector(".modal__overlay");
  const closeBtn = overlay.querySelector(".modal__close");
  const form = overlay.querySelector(".review-form");

  function close() {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
  }
  function onKey(e) {
    if (e.key === "Escape") close();
  }
  overlay.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal__overlay")) close();
  });
  closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", onKey);

  // Poster un avis
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const note = Number(fd.get("rate")) || 0;
    const texte = (fd.get("comment") || "").toString().trim();
    if (!note || !texte) {
      alert("Merci d’ajouter une note et un commentaire.");
      return;
    }
    pushAvisLocal(d.id, {
      user: DEFAULT_USER(),
      note,
      texte,
      date: new Date().toISOString().slice(0, 10),
    });
    overlay.remove(); // simple refresh du modal
    openModal(d);
  });

  // Boutons actions (placeholder carte / favoris)
  overlay.querySelector(".open-map")?.addEventListener("click", (e) => {
    const lat = e.currentTarget.getAttribute("data-lat");
    const lng = e.currentTarget.getAttribute("data-lng");
    alert(`Bientôt la carte intégrée :\nLat: ${lat}\nLng: ${lng}`);
  });

  overlay.querySelector(".add-fav")?.addEventListener("click", () => {
    const favKey = "wanderia:favs";
    const favs = new Set(JSON.parse(localStorage.getItem(favKey) || "[]"));
    favs.add(d.id);
    localStorage.setItem(favKey, JSON.stringify([...favs]));
    alert("Ajouté aux favoris ✅");
  });
}

// Tilt 3D -------------------------------------------------------------

function attachTilt(card) {
  const MAX_TILT = 10; // deg
  const rect = () => card.getBoundingClientRect();

  function move(e) {
    const r = rect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dx = (e.clientX - cx) / (r.width / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    const rx = clamp(-dy * MAX_TILT, -MAX_TILT, MAX_TILT);
    const ry = clamp(dx * MAX_TILT, -MAX_TILT, MAX_TILT);

    card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
  }
  function leave() {
    card.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
  }

  card.addEventListener("mousemove", move);
  card.addEventListener("mouseleave", leave);
  card.addEventListener("touchmove", (e) => {
    if (!e.touches[0]) return;
    move(e.touches[0]);
  });
  card.addEventListener("touchend", leave);
}

// Chargement principal ------------------------------------------------------

async function loadDestinations() {
  const grid = document.getElementById("destGrid");
  const filters = document.getElementById("filters");
  if (!grid) return;

  // 1) Charger les données
  const res = await fetch("js/lieux.json");
  let data = await res.json();

  // 2) Normaliser
  data = data.map((d, i) => {
    const id = d.id || slug(`${d.ville || ""}_${d.nom || i}`);
    const type = d.categories?.[0] || "Ville";
    const img = d.cover || `assets/img/lieu${(i % 5) + 1}.png`;
    const noteMoy =
      d.noteMoy ||
      (Array.isArray(d.avis) && d.avis.length
        ? d.avis.reduce((s, a) => s + Number(a.note || 0), 0) / d.avis.length
        : 0);
    return { ...d, id, type, cover: img, noteMoy };
  });

  // 3) Filtres dynamiques
  renderFilters(filters, data);
  let currentFilter = "all";

  // 4) Rendu grid
  function render() {
    const list =
      currentFilter === "all"
        ? data
        : data.filter((d) => (d.categories || []).includes(currentFilter));

    grid.innerHTML = list.map(cardHTML).join("") || `<p>Aucun résultat.</p>`;

    // Tilt 3D + handlers
    grid.querySelectorAll(".tilt3d").forEach(attachTilt);

    // Ouvrir modal
    grid.querySelectorAll(".open-modal").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const d = data.find((x) => x.id === id);
        if (d) openModal(d);
      });
    });
  }

  // 5) Écoute filtres
  filters?.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-pill");
    if (!btn) return;
    filters.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.type || "all";
    render();
  });

  render();
}

// Bootstrap
document.readyState !== "loading"
  ? loadDestinations()
  : document.addEventListener("DOMContentLoaded", loadDestinations);
