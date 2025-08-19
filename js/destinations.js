// destinations.js — corrections visibilité/contraste + rangée actions + feed stable

const STORAGE_AVIS = "wanderia:avis";
const STORAGE_LIKES = "wanderia:likes";
const STORAGE_SAVES = "wanderia:saves";
const STORAGE_COMMENTS = "wanderia:comments";
const STORAGE_LIKE_COUNT = "wanderia:likeCount";

const DEFAULT_USER = () => {
  const u = JSON.parse(localStorage.getItem("wanderia:user") || "null");
  return u?.name || "Voyageur";
};

const slug = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

/* ---------- Stars ---------- */
function starsHTML(note, size = 16) {
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

/* ---------- Avis / Comments ---------- */
function getAvisLocaux(id){const all=JSON.parse(localStorage.getItem(STORAGE_AVIS)||"{}");return Array.isArray(all[id])?all[id]:[]}
function pushAvisLocal(id, avis){const all=JSON.parse(localStorage.getItem(STORAGE_AVIS)||"{}");all[id]=[...(all[id]||[]),avis];localStorage.setItem(STORAGE_AVIS,JSON.stringify(all))}
function getComments(id){const all=JSON.parse(localStorage.getItem(STORAGE_COMMENTS)||"{}");return Array.isArray(all[id])?all[id]:[]}
function pushComment(id,c){const all=JSON.parse(localStorage.getItem(STORAGE_COMMENTS)||"{}");all[id]=[...(all[id]||[]),c];localStorage.setItem(STORAGE_COMMENTS,JSON.stringify(all))}

/* ---------- Likes / Saves ---------- */
const getSet=(k)=>new Set(JSON.parse(localStorage.getItem(k)||"[]"));
const putSet=(k,set)=>localStorage.setItem(k,JSON.stringify([...set]));
const getLikeCount=(id)=>{const all=JSON.parse(localStorage.getItem(STORAGE_LIKE_COUNT)||"{}");return Number(all[id]||0)}
const setLikeCount=(id,n)=>{const all=JSON.parse(localStorage.getItem(STORAGE_LIKE_COUNT)||"{}");all[id]=Math.max(0,Number(n||0));localStorage.setItem(STORAGE_LIKE_COUNT,JSON.stringify(all))}

/* ---------- Icônes ---------- */
const ICON={
  heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.6-4.35-9.33-7.08A6.59 6.59 0 1 1 12 5.1a6.59 6.59 0 1 1 9.33 8.82C18.6 16.65 12 21 12 21z"/></svg>',
  comment:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 2H4a2 2 0 0 0-2 2v16l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/></svg>',
  bookmark:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h12a1 1 0 0 1 1 1v19l-7-4-7 4V3a1 1 0 0 1 1-1z"/></svg>',
  info:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 17h2v-6h-2v6zm0-8h2V7h-2v2zm1-7C5.48 2 1 6.48 1 12s4.48 10 10 10 10-4.48 10-10S18.52 2 12 2z"/></svg>',
  map:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3l-5.7 2.1L9 3 3.5 5v16l6.2-2.3 5.8 2.2 5-2V3zM9 5.3l5 1.9v11.5l-5-1.9V5.3z"/></svg>'
};

/* ---------- Modal ---------- */
function modalHTML(d, avisLocaux){
  const avisAll=[...(d.avis||[]),...avisLocaux];
  const note=avisAll.length>0?avisAll.reduce((s,a)=>s+Number(a.note||0),0)/avisAll.length:Number(d.noteMoy||0);
  const tags=(d.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("");
  const prox=d.proximite?.length?d.proximite.map(p=>`<li><strong>${p.type}</strong> • ${p.nom} <small>(${p.distance_m} m)</small></li>`).join(""):"<li>Aucune donnée</li>";
  const avisHTML=avisAll.length===0?'<p class="muted">Pas encore d’avis. Soyez le premier !</p>':avisAll.map(a=>`<div class="review"><div class="review__head"><strong>${a.user||"Voyageur"}</strong><span class="review__stars">${"★".repeat(a.note)}${"☆".repeat(5-a.note)}</span></div><p>${a.texte||""}</p><small class="muted">${a.date||""}</small></div>`).join("");
  const galerie=d.galerie?.length>1?`<div class="gallery">${d.galerie.map(g=>`<img src="${g}" alt="${d.nom}">`).join("")}</div>`:"";

  return `
  <div class="modal__overlay">
    <div class="modal">
      <button class="modal__close" aria-label="Fermer">×</button>
      <div class="modal__media">
        <img src="${d.cover}" alt="${d.nom}">
        ${d.categories?.[0]?`<span class="card__badge">${d.categories[0]}</span>`:""}
      </div>
      <div class="modal__content">
        <header class="modal__header"><h3>${d.nom}</h3>${starsHTML(note,16)}</header>
        <p class="muted">${d.resume||d.description||""}</p>
        <ul class="meta">
          <li><strong>Ville</strong> : ${d.ville||"-"}</li>
          <li><strong>Pays</strong> : ${d.pays||"-"}</li>
          <li><strong>Ouvert</strong> : ${d.ouvert||"-"}</li>
          <li><strong>Durée</strong> : ${d.duree||"-"}</li>
          <li><strong>Tarif</strong> : ${d.prix||"-"}</li>
        </ul>
        ${tags?`<div class="tags">${tags}</div>`:""}
        ${galerie}
        <details class="box"><summary>À proximité</summary><ul class="list">${prox}</ul></details>

        <section class="box">
          <h4 style="margin:0 0 8px;">Avis</h4>
          <div class="reviews">${avisHTML}</div>
          <form class="review-form" data-id="${d.id}">
            <label>Votre note</label>
            <div class="rate" role="radiogroup" aria-label="Note sur 5">
              ${[5,4,3,2,1].map(n=>`<input type="radio" id="r${n}" name="rate" value="${n}"><label for="r${n}" title="${n} étoiles">★</label>`).join("")}
            </div>
            <textarea name="comment" rows="3" placeholder="Partagez votre expérience..."></textarea>
            <button type="submit" class="btn-pill">Publier</button>
          </form>
        </section>

        <div class="modal__footer">
          <button class="btn-pill ghost open-map" data-lat="${d.latitude}" data-lng="${d.longitude}">Voir sur la carte</button>
          <button class="btn-pill add-fav" data-id="${d.id}">Ajouter aux favoris</button>
        </div>
      </div>
    </div>
  </div>`;
}
function openModal(d){
  const html=modalHTML(d,getAvisLocaux(d.id));
  document.body.insertAdjacentHTML("beforeend",html);
  const overlay=document.querySelector(".modal__overlay");
  const closeBtn=overlay.querySelector(".modal__close");
  const form=overlay.querySelector(".review-form");
  const close=()=>{overlay.remove();document.removeEventListener("keydown",onKey);}
  const onKey=(e)=>{if(e.key==="Escape")close()}
  overlay.addEventListener("click",(e)=>{if(e.target.classList.contains("modal__overlay"))close()});
  closeBtn.addEventListener("click",close);
  document.addEventListener("keydown",onKey);

  // Publier un avis
  form?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const fd=new FormData(form);
    const note=Number(fd.get("rate"))||0;
    const texte=(fd.get("comment")||"").toString().trim();
    if(!note||!texte){alert("Merci d’ajouter une note et un commentaire.");return;}
    pushAvisLocal(d.id,{user:DEFAULT_USER(),note,texte,date:new Date().toISOString().slice(0,10)});
    overlay.remove(); openModal(d);
  });

  // Carte
  overlay.querySelector(".open-map")?.addEventListener("click",(e)=>{
    const lat=Number(e.currentTarget.getAttribute("data-lat"));
    const lng=Number(e.currentTarget.getAttribute("data-lng"));
    openMapOverlay(lat,lng,d.nom);
  });

  // Favoris
  overlay.querySelector(".add-fav")?.addEventListener("click",()=>{
    const k="wanderia:favs"; const favs=new Set(JSON.parse(localStorage.getItem(k)||"[]")); favs.add(d.id);
    localStorage.setItem(k,JSON.stringify([...favs])); alert("Ajouté aux favoris ✅");
  });
}

/* ---------- Carte Leaflet Overlay ---------- */
let leafletMap;
function openMapOverlay(lat,lng,title="Lieu"){
  const overlay=document.getElementById("mapOverlay");
  const canvas=document.getElementById("leafletMap");
  overlay.hidden=false;
  if(!leafletMap){
    leafletMap=L.map(canvas);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{maxZoom:19,attribution:"&copy; OpenStreetMap contributors"}).addTo(leafletMap);
  }
  leafletMap.setView([lat,lng],14);
  L.marker([lat,lng]).addTo(leafletMap).bindPopup(title).openPopup();
  overlay.querySelector(".map-close").onclick=()=>overlay.hidden=true;
  overlay.onclick=(e)=>{if(e.target.id==="mapOverlay")overlay.hidden=true;}
}

/* ---------- Rendu Post ---------- */
function postHTML(d,{liked,saved,commentsCount,likeCount}){
  const badge=(d.categories?.[0]||"Ville");
  const note=Number(d.noteMoy||0);
  const price=d.prix||"—";
  const villePays=[d.ville,d.pays].filter(Boolean).join(", ");
  const avatar=(d.ville||d.nom||"W")[0]?.toUpperCase()||"W";
  const dataCat=(badge||"").toLowerCase();

  return `
  <article class="post reveal" data-id="${d.id}" data-cat="${dataCat}">
    <header class="post__header">
      <div class="post__avatar">${avatar}</div>
      <div class="post__meta">
        <span class="post__title">${d.nom}</span>
        <small class="post__subtitle">📍 ${villePays||"—"}</small>
      </div>
    </header>

    <figure class="post__media">
      <img loading="lazy" src="${d.cover}" alt="${d.nom}">
      <figcaption class="post__badge">${badge}</figcaption>
    </figure>

    <div class="post__actions">
      <div class="actions-left">
        <button class="btn-icon btn-like" aria-pressed="${liked?"true":"false"}" title="J'aime">
          ${ICON.heart} <span class="like-count">${likeCount}</span>
        </button>
        <button class="btn-icon btn-comment" title="Commentaires">
          ${ICON.comment} <span class="comment-count">${commentsCount}</span>
        </button>
        <button class="btn-icon btn-save" aria-pressed="${saved?"true":"false"}" title="Enregistrer">${ICON.bookmark}</button>
        <button class="btn-icon btn-map" data-lat="${d.latitude}" data-lng="${d.longitude}" data-title="${d.nom}" title="Voir sur la carte">${ICON.map}</button>
      </div>
      <div class="actions-right">
        <button class="btn-icon btn-details open-modal" data-id="${d.id}" title="Détails">${ICON.info} Détails</button>
      </div>
    </div>

    <div class="post__body">
      <div class="post__row"><span>${starsHTML(note,14)}</span><span><strong>Tarif</strong> : ${price}</span></div>
      <div class="post__row"><span>📌 ${Number(d.latitude).toFixed(3)}, ${Number(d.longitude).toFixed(3)}</span><span>⏱️ ${d.duree||"—"}</span></div>

      <div class="post__comments">
        <details>
          <summary>Voir les commentaires</summary>
          <div class="comments-list">
            ${getComments(d.id).map(c=>`<div class="comment"><strong>${c.user}</strong><p>${c.texte}</p><small>${c.date}</small></div>`).join("")}
          </div>
          <form class="comment-form" data-id="${d.id}">
            <textarea name="comment" placeholder="Ajouter un commentaire…"></textarea>
            <button type="submit" class="btn-icon">Publier</button>
          </form>
        </details>
      </div>
    </div>
  </article>`;
}

/* ---------- Main ---------- */
async function loadDestinations(){
  const grid=document.getElementById("destGrid");
  const searchInput=document.getElementById("searchInput");
  const clearBtn=document.getElementById("clearSearch");
  const categoryFilter=document.getElementById("categoryFilter");
  const resultsCount=document.getElementById("resultsCount");
  if(!grid) return;

  grid.classList.add("feed","masonry");

  const res=await fetch("js/lieux.json");
  let data=await res.json();

  data=data.map((d,i)=>{
    const id=d.id||slug(`${d.ville||""}_${d.nom||i}`);
    const type=d.categories?.[0]||"Ville";
    const img=d.cover||`assets/img/lieu${(i%5)+1}.png`;
    const noteMoy=d.noteMoy||(Array.isArray(d.avis)&&d.avis.length?d.avis.reduce((s,a)=>s+Number(a.note||0),0)/d.avis.length:0);
    return {...d,id,type,cover:img,noteMoy};
  });

  let likes=getSet(STORAGE_LIKES);
  let saves=getSet(STORAGE_SAVES);

  const FEED_CHUNK=6;
  let filtered=data.slice();
  let visible=FEED_CHUNK;

  function filterData(){
    const term=(searchInput?.value||"").toLowerCase().trim();
    const cat=(categoryFilter?.value||"all").toLowerCase();
    filtered=data.filter(d=>{
      const matchSearch=d.nom?.toLowerCase().includes(term)||d.ville?.toLowerCase().includes(term)||d.pays?.toLowerCase().includes(term);
      const matchCat=cat==="all"||(d.categories||[]).map(c=>c.toLowerCase()).includes(cat);
      return matchSearch&&matchCat;
    });
    visible=FEED_CHUNK;
    resultsCount.textContent=`${filtered.length} résultat${filtered.length>1?"s":""}`;
  }

  function render(append=false){
    const slice=filtered.slice(0,visible);
    const html=slice.map(d=>postHTML(d,{
      liked:likes.has(d.id),
      saved:saves.has(d.id),
      commentsCount:getComments(d.id).length,
      likeCount:getLikeCount(d.id)
    })).join("");

    if(append){grid.insertAdjacentHTML("beforeend",html)}else{grid.innerHTML=html}

    // Détails
    grid.querySelectorAll(".open-modal").forEach(btn=>{
      btn.addEventListener("click",()=>{
        const id=btn.getAttribute("data-id");
        const d=data.find(x=>x.id===id);
        if(d) openModal(d);
      });
    });

    // Apparition douce
    const io=new IntersectionObserver((ents)=>{
      ents.forEach(e=>{if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target);}})
    },{threshold:.12});
    grid.querySelectorAll(".post").forEach(el=>io.observe(el));
  }

  // Actions délégation
  grid.addEventListener("click",(e)=>{
    const post=e.target.closest(".post"); if(!post) return;
    const id=post.getAttribute("data-id");

    if(e.target.closest(".btn-like")){
      const btn=e.target.closest(".btn-like");
      const pressed=btn.getAttribute("aria-pressed")==="true";
      let count=getLikeCount(id);
      if(pressed){likes.delete(id);count=Math.max(0,count-1)}else{likes.add(id);count=count+1}
      setLikeCount(id,count); putSet(STORAGE_LIKES,likes);
      btn.setAttribute("aria-pressed",(!pressed).toString());
      btn.querySelector(".like-count").textContent=count;
    }

    if(e.target.closest(".btn-save")){
      const btn=e.target.closest(".btn-save");
      const pressed=btn.getAttribute("aria-pressed")==="true";
      if(pressed) saves.delete(id); else saves.add(id);
      putSet(STORAGE_SAVES,saves);
      btn.setAttribute("aria-pressed",(!pressed).toString());
    }

    if(e.target.closest(".btn-map")){
      const btn=e.target.closest(".btn-map");
      openMapOverlay(Number(btn.getAttribute("data-lat")),Number(btn.getAttribute("data-lng")),btn.getAttribute("data-title")||"Lieu");
    }
  });

  // Commentaires
  grid.addEventListener("submit",(e)=>{
    const form=e.target.closest(".comment-form"); if(!form) return;
    e.preventDefault();
    const id=form.getAttribute("data-id");
    const texte=(new FormData(form).get("comment")||"").toString().trim();
    if(!texte) return;
    const c={user:DEFAULT_USER(),texte,date:new Date().toISOString().slice(0,10)};
    pushComment(id,c);
    const post=grid.querySelector(`.post[data-id="${id}"]`);
    post.querySelector(".comments-list").insertAdjacentHTML("beforeend",`<div class="comment"><strong>${c.user}</strong><p>${c.texte}</p><small>${c.date}</small></div>`);
    const counter=post.querySelector(".comment-count"); counter.textContent=String(Number(counter.textContent||0)+1);
    form.reset();
  });

  // Recherche/filtre/reset
  const onChange=()=>{filterData();render(false)};
  searchInput?.addEventListener("input",onChange);
  categoryFilter?.addEventListener("change",onChange);
  clearBtn?.addEventListener("click",()=>{searchInput.value="";onChange();searchInput.focus()});

  // Scroll infini
  const onScroll=()=>{const nearBottom=window.innerHeight+window.scrollY>=document.body.offsetHeight-600;
    if(nearBottom&&visible<filtered.length){visible+=FEED_CHUNK;render(true)}};
  window.addEventListener("scroll",onScroll,{passive:true});

  // Init
  filterData(); render(false);
}

document.readyState!=="loading"
  ? loadDestinations()
  : document.addEventListener("DOMContentLoaded", loadDestinations);
