(() => {
  const stage = document.getElementById('cfStage');
  if (!stage) return;

  // 1) Récupère toutes tes images existantes dans #cfStage
  const sources = Array.from(stage.querySelectorAll('.cf-card img'))
    .map(img => img.getAttribute('src'))
    .filter(Boolean);

  if (sources.length === 0) return;

  // 2) Remplace le contenu par 5 slots fixes (immobiles)
  stage.innerHTML = `
    <div class="cf-slot left2"><img alt=""></div>
    <div class="cf-slot left1"><img alt=""></div>
    <div class="cf-slot center"><img alt=""></div>
    <div class="cf-slot right1"><img alt=""></div>
    <div class="cf-slot right2"><img alt=""></div>
  `;

  const slotL2 = stage.querySelector('.left2 img');
  const slotL1 = stage.querySelector('.left1 img');
  const slotC  = stage.querySelector('.center img');
  const slotR1 = stage.querySelector('.right1 img');
  const slotR2 = stage.querySelector('.right2 img');

  const btnPrev = document.getElementById('cfPrev');
  const btnNext = document.getElementById('cfNext');

  const n = sources.length;
  const mod = (a, b) => ((a % b) + b) % b;

  // Indice de l'image du milieu (courante)
  let i = Math.floor(n / 2);

  // Alimente les slots. On anime UNIQUEMENT le centre.
  function fill(animateCenter = true) {
    // Voisins : mis à jour instantanément (positions fixes, pas d'animation)
    slotL2.src = sources[mod(i - 2, n)];
    slotL1.src = sources[mod(i - 1, n)];
    slotR1.src = sources[mod(i + 1, n)];
    slotR2.src = sources[mod(i + 2, n)];

    // Centre : crossfade + petit zoom
    if (!animateCenter) {
      slotC.style.transition = 'none';
      slotC.style.opacity = 1;
      slotC.style.transform = 'scale(1)';
      slotC.src = sources[mod(i, n)];
      // force reflow puis réactive la transition pour les prochaines fois
      void slotC.offsetWidth;
      slotC.style.transition = '';
      return;
    }

    // départ : disparaît un peu
    slotC.style.opacity = 0;
    slotC.style.transform = 'scale(0.94)';

    // Attends un tick, change la source, puis fais ré-apparaître
    setTimeout(() => {
      slotC.src = sources[mod(i, n)];
      slotC.style.opacity = 1;
      slotC.style.transform = 'scale(1)';
    }, 90);
  }

  function next(){ i = mod(i + 1, n); fill(true); }
  function prev(){ i = mod(i - 1, n); fill(true); }

  // Interactions : pause auto, puis reprise
  const AUTOPLAY_MS = 3000;
  const RESUME_MS   = 6000;
  let auto = null, resumeTimer = null;

  const startAuto = () => { if (!auto) auto = setInterval(next, AUTOPLAY_MS); };
  const stopAuto  = () => { if (auto) { clearInterval(auto); auto = null; } };
  const pauseThenResume = () => {
    stopAuto();
    if (resumeTimer) clearTimeout(resumeTimer);
    resumeTimer = setTimeout(startAuto, RESUME_MS);
  };

  // Boutons
  btnNext?.addEventListener('click', () => { pauseThenResume(); next(); });
  btnPrev?.addEventListener('click', () => { pauseThenResume(); prev(); });

  // Clic sur les côtés pour avancer/reculer (facultatif)
  stage.querySelector('.right1')?.addEventListener('click', () => { pauseThenResume(); next(); });
  stage.querySelector('.left1') ?.addEventListener('click', () => { pauseThenResume(); prev(); });
  stage.querySelector('.right2')?.addEventListener('click', () => { pauseThenResume(); next(); });
  stage.querySelector('.left2') ?.addEventListener('click', () => { pauseThenResume(); prev(); });

  // Molette & swipe
  let startX = 0;
  stage.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) + Math.abs(e.deltaY) < 2) return;
    e.preventDefault();
    pauseThenResume();
    (e.deltaY > 0 || e.deltaX > 0) ? next() : prev();
  }, { passive: false });

  stage.addEventListener('touchstart', e => { startX = e.touches[0].clientX; pauseThenResume(); }, { passive:true });
  stage.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 30) (dx < 0 ? next() : prev());
  });

  // Init + autoplay
  fill(false);
  startAuto();

  // Sécurité quand on revient sur l’onglet
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && !auto) startAuto();
  });
})();