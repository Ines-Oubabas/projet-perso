// js/home-hero.js
// Animations GSAP : hero reveal, chips, slider 3D en arc, scroll reveal

(() => {
  const { gsap } = window;
  if (!gsap) return;

  // ---------------- NAV + HERO ENTRANCE ----------------
  gsap.from(".nav", { y: -40, opacity: 0, duration: 0.7, ease: "power3.out" });

  gsap.from(".hero-word", {
    opacity: 0,
    scale: 1.08,
    duration: 1.0,
    ease: "power2.out",
    delay: 0.1
  });

  gsap.from([".hero-title", ".hero-subtitle", ".cta"], {
    y: 24,
    opacity: 0,
    stagger: 0.1,
    ease: "power3.out",
    duration: 0.7,
    delay: 0.2
  });

  // ---------------- Chips d’exploration ----------------
  gsap.from(".quick-chips .chip", {
    y: 16,
    opacity: 0,
    stagger: 0.08,
    duration: 0.5,
    ease: "power2.out",
    delay: 0.4
  });

  document.querySelectorAll(".quick-chips .chip").forEach((b) => {
    b.addEventListener("click", () => {
      const url = b.dataset.target;
      if (url) window.location.href = url;
    });
  });

  // ---------------- SLIDER 3D EN ARC -------------------
  const cards = Array.from(document.querySelectorAll(".arc-card"));
  const track = document.querySelector(".arc-track");

  if (cards.length && track) {
    // Accessibilité clavier
    track.setAttribute("tabindex", "0");

    // perspective globale (CSS gérée aussi)
    const perspective = 1200;
    track.style.perspective = perspective + "px";
    track.style.transformStyle = "preserve-3d";

    let activeIndex = Math.floor(cards.length / 2);

    function clamp(min, v, max) { return Math.max(min, Math.min(max, v)); }

    // calcule les paramètres responsive
    function getLayoutConfig() {
      const w = window.innerWidth || 1200;

      // marge interne pour éviter de mordre sur les bords
      const sidePadding = Math.max(24, Math.round(w * 0.06));
      track.style.paddingLeft = sidePadding + "px";
      track.style.paddingRight = sidePadding + "px";

      // écart horizontal entre cartes
      const gap = clamp(90, Math.round(w * 0.08), 160);

      // profondeur Z (plus petit sur mobile)
      const radius = clamp(260, Math.round(w * 0.35), 480);

      // rotation Y par “cran”
      const rot = clamp(14, Math.round(w * 0.022), 22);

      return { gap, radius, rot };
    }

    function layout(index = activeIndex, animate = true) {
      activeIndex = clamp(0, index, cards.length - 1);
      const { gap, radius, rot } = getLayoutConfig();

      cards.forEach((card, i) => {
        const d = i - activeIndex;
        const x = d * gap;
        const z = -Math.abs(d) * (radius / 2) + (i === activeIndex ? 0 : -60);
        const ry = d * rot;

        const props = {
          x, z,
          rotateY: ry,
          scale: i === activeIndex ? 1 : 0.92,
          opacity: Math.max(0.15, 1 - Math.abs(d) * 0.15),
          ease: "power3.out",
          duration: animate ? 0.55 : 0
        };
        gsap.to(card, props);
      });
    }

    // position initiale sans animation
    layout(activeIndex, false);

    // hover/focus recentrent l’élément
    cards.forEach((card, i) => {
      card.addEventListener("mouseenter", () => layout(i, true));
      card.addEventListener("focus", () => layout(i, true));
    });

    // navigation clavier
    track.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { layout(activeIndex + 1, true); }
      if (e.key === "ArrowLeft")  { layout(activeIndex - 1, true); }
    });

    // relayout au resize (debounce)
    let t;
    window.addEventListener("resize", () => {
      clearTimeout(t);
      t = setTimeout(() => layout(activeIndex, false), 120);
    });

    // petite apparition au scroll
    if (window.ScrollTrigger) {
      gsap.from(cards, {
        opacity: 0,
        y: 30,
        stagger: 0.06,
        ease: "power2.out",
        duration: 0.5,
        scrollTrigger: {
          trigger: "#arcSlider",
          start: "top 75%"
        }
      });
    }
  }

  // -------- REVEAL “Destinations Populaires” ----------
  if (window.ScrollTrigger) {
    gsap.from("#popular .section-title", {
      opacity: 0, y: 20, duration: 0.6, ease: "power2.out",
      scrollTrigger: { trigger: "#popular", start: "top 80%" }
    });
    gsap.from("#popular .carousel-track li", {
      opacity: 0, y: 30, stagger: 0.06, duration: 0.5, ease: "power2.out",
      scrollTrigger: { trigger: "#popular", start: "top 70%" }
    });
  }
})();

// ----- deuxieme formulaires -----
<script>
  // Témoignages (auto-rotation simple)
  (function(){
    const items = [
      {
        text: "“WanderIA m’a trouvé des spots incroyables à Tokyo. Simple, beau et intelligent.”",
        name: "Ines K.", role: "/ Étudiante"
      },
      {
        text: "“Le meilleur site pour planifier un week-end en Europe. J’adore les suggestions IA.”",
        name: "Yann M.", role: "/ Développeur"
      },
      {
        text: "“Des itinéraires super bien pensés. On gagne un temps fou.”",
        name: "Aïcha D.", role: "/ Photographe"
      }
    ];

    const txt = document.getElementById('tstiText');
    const name = document.getElementById('tstiName');
    const role = document.getElementById('tstiRole');
    const dotsBox = document.getElementById('tstiDots');

    if (!txt || !name || !role || !dotsBox) return;

    let i = 0;
    items.forEach((_, idx) => {
      const b = document.createElement('button');
      b.addEventListener('click', () => { i = idx; render(true); });
      dotsBox.appendChild(b);
    });

    function render(jump=false){
      const dots = dotsBox.querySelectorAll('button');
      dots.forEach((d,k)=>d.classList.toggle('active', k===i));
      if (!jump){ txt.style.opacity = 0; name.style.opacity = 0; role.style.opacity = 0; }
      setTimeout(()=>{
        txt.textContent = items[i].text;
        name.textContent = items[i].name;
        role.textContent = ' ' + items[i].role;
        txt.style.opacity = 1; name.style.opacity = 1; role.style.opacity = 1;
      }, jump ? 0 : 180);
    }

    function next(){ i = (i+1) % items.length; render(); }

    render(true);
    let auto = setInterval(next, 4500);
    dotsBox.addEventListener('mouseenter', ()=>clearInterval(auto));
    dotsBox.addEventListener('mouseleave', ()=>auto = setInterval(next, 4500));
  })();
</script>

