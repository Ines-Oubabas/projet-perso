/* js/home-coverflow.js
   Coverflow 3D (GSAP + Draggable) pour la section "Destinations Populaires"
*/
(() => {
  const stage = document.getElementById('cfStage');
  if (!stage) return;

  const cards = Array.from(stage.querySelectorAll('.cf-card'));
  if (!cards.length) return;

  // ----------- Setup visuel de base (au cas où le CSS n'est pas encore ajouté)
  gsap.set(stage, { perspective: 1200, transformStyle: 'preserve-3d' });
  gsap.set(cards, {
    position: 'relative',
    width: 'min(320px, 32vw)',
    aspectRatio: 4 / 5,
    borderRadius: 16,
    padding: 0,
    border: '1px solid var(--border)',
    background: 'transparent',
    outline: 'none',
    overflow: 'hidden',
    cursor: 'pointer',
    boxShadow: '0 14px 38px rgba(0,0,0,.35)'
  });
  gsap.set(cards.map(c => c.querySelector('img')), {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  });

  // ----------- Paramètres coverflow
  const cfg = {
    spacing: 240,        // distance horizontale entre cartes
    rot:  -35,           // rotationY de chaque côté
    zLift: 180,          // profondeur Z du centre
    sideZDrop: -260,     // recul des cartes latérales
    scaleC: 1,           // scale centre
    scaleS: 0.84,        // scale côtés
    fadeS: 0.35,         // opacité mini côté
    ease: 'power3.out',
    dur: 0.6
  };

  let idx = 0;            // index "courant" (fractionnel durant le drag)
  let target = 0;         // snap cible

  // ----------- Layout réactif
  function resize() {
    const w = stage.clientWidth || window.innerWidth;
    // Ajuste l’espacement et les tailles selon la largeur
    const s = gsap.utils.clamp(160, 280, w * 0.18);
    cfg.spacing = gsap.utils.clamp(180, 300, s * 1.3);
  }

  // ----------- Rendu d’une position "i" (peut être fractionnelle)
  function render(i) {
    cards.forEach((card, k) => {
      const d = k - i;                             // delta par rapport au centre
      const ad = Math.abs(d);

      const x = d * cfg.spacing;
      const z = gsap.utils.mapRange(0, 3, cfg.zLift, cfg.sideZDrop, ad);
      const r = gsap.utils.clamp(-65, 65, -cfg.rot * Math.sign(d) * Math.min(ad, 1));
      const s = gsap.utils.mapRange(0, 3, cfg.scaleC, cfg.scaleS, ad);
      const o = gsap.utils.mapRange(0, 3, 1, cfg.fadeS, ad);

      gsap.to(card, {
        duration: cfg.dur,
        x, z, rotationY: r, scale: s, opacity: o,
        zIndex: 1000 - Math.round(ad * 10),
        ease: cfg.ease
      });
    });
  }

  // ----------- Drag (inertie simple)
  const proxy = document.createElement('div');
  let startIdx = 0;
  const dragFactor = 1 / cfg.spacing; // translation -> delta index

  Draggable.create(proxy, {
    type: 'x',
    trigger: stage,
    onDragStart() {
      startIdx = idx;
      gsap.killTweensOf({}); // stop animations de snap en cours
    },
    onDrag() {
      idx = startIdx - this.x * dragFactor;
      render(idx);
    },
    onDragEnd() {
      target = Math.round(idx);
      snapTo(target);
    }
  });

  function snapTo(n) {
    target = gsap.utils.clamp(0, cards.length - 1, n);
    gsap.to({ val: idx }, {
      val: target,
      duration: 0.5,
      ease: 'power3.out',
      onUpdate() {
        idx = this.targets()[0].val;
        render(idx);
      }
    });
    // remet le proxy à zéro pour le prochain drag
    gsap.set(proxy, { x: 0 });
  }

  // ----------- Interactions
  // Clic sur une carte -> centrage
  cards.forEach((card, k) => {
    card.addEventListener('click', () => snapTo(k));
  });

  // Clavier ← →
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft')  snapTo(target - 1);
    if (e.key === 'ArrowRight') snapTo(target + 1);
  });

  // Chips (si présentes sur la page) -> centrage approximatif
  document.querySelectorAll('.quick-chips .chip').forEach((chip, n) => {
    chip.addEventListener('click', () => snapTo(n));
  });

  // Resize
  window.addEventListener('resize', () => {
    resize();
    render(idx);
  });

  // ----------- Init
  resize();
  render(idx);
})();
