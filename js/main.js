/* =========================================================
   CHHUKS FITNESS — interactions & GSAP animation
   Mirrors the lahuella.club motion system:
   ScrollSmoother · ScrollTrigger · SplitText · Swiper · lightGallery
   ========================================================= */
(function () {
  "use strict";

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother, SplitText);

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;
  let smoother = null;

  /* ---------- helpers ---------- */
  const q  = (s, c = document) => c.querySelector(s);
  const qa = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* =========================================================
     1. PRELOADER  →  then boot everything
     ========================================================= */
  function runPreloader(onDone) {
    const pre = q("#preloader");
    if (!pre || reduced) {
      if (pre) pre.remove();
      onDone();
      return;
    }
    document.body.classList.add("no-scroll");
    const counter = { v: 0 };
    const countEl = q(".pl-count");
    const bar = q(".pl-bar");

    const tl = gsap.timeline({
      onComplete() {
        document.body.classList.remove("no-scroll");
        onDone();
        gsap.to(pre, {
          yPercent: -100, duration: 0.9, ease: "power4.inOut",
          onComplete: () => pre.remove()
        });
      }
    });
    tl.to(counter, {
      v: 100, duration: 1.6, ease: "power2.inOut",
      onUpdate: () => { countEl.textContent = String(Math.round(counter.v)).padStart(2, "0"); }
    }, 0)
      .to(bar, { width: "100%", duration: 1.6, ease: "power2.inOut" }, 0)
      .from(".pl-word span", { yPercent: 110, duration: 0.9, ease: "power3.out" }, 0.1)
      .to(".pl-word span", { yPercent: -110, duration: 0.6, ease: "power3.in" }, "-=0.1");
  }

  /* =========================================================
     2. SMOOTH SCROLL
     ========================================================= */
  function initSmoother() {
    if (reduced) return;
    smoother = ScrollSmoother.create({
      wrapper: "#smooth-wrapper",
      content: "#smooth-content",
      smooth: 1.2,
      smoothTouch: 0.1,
      effects: true,        // enables [data-speed] / [data-lag] parallax
      normalizeScroll: true
    });
  }

  function scrollToTarget(target) {
    if (smoother) smoother.scrollTo(target, true, "top top");
    else target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
  }

  /* =========================================================
     3. HERO — load reveal · cycling word · Ken Burns · pause
     ========================================================= */
  function initHeroRotator() {
    const words = q(".ht-words");
    if (!words) return null;
    const n = words.querySelectorAll(".ht-word").length; // includes 1 clone for seamless loop
    const real = n - 1;
    const step = 100 / n;
    const tl = gsap.timeline({ repeat: -1, defaults: { duration: 0.7, ease: "expo.inOut" } });
    for (let k = 1; k <= real; k++) {
      tl.to(words, { yPercent: -step * k }, "+=1.6");
    }
    tl.set(words, { yPercent: 0 }); // jump from clone back to the real first word — seamless
    return tl;
  }

  function initHero() {
    const heroImg = q(".hero__media img");
    const pause = q(".hero-pause");
    let kb = null;      // ken burns tween
    let rotTl = null;   // word rotator timeline

    // slow cinematic zoom (the pause button toggles this)
    if (heroImg) {
      if (reduced) gsap.set(heroImg, { scale: 1.04 });
      else kb = gsap.to(heroImg, { scale: 1.14, duration: 16, ease: "none", repeat: -1, yoyo: true });
    }

    if (pause) {
      pause.addEventListener("click", () => {
        const paused = pause.classList.toggle("is-paused");
        pause.setAttribute("aria-pressed", String(paused));
        if (kb) kb.paused(paused);
        if (rotTl) rotTl.paused(paused);
      });
    }

    if (reduced) {
      gsap.set(".ht-line > span, .ht-rotator", { yPercent: 0, opacity: 1 });
      rotTl = null; // word stays on the first option
      return;
    }

    const tl = gsap.timeline({ delay: 0.15 });
    tl.from([".ht-top > span", ".ht-rotator", ".ht-bot > span"],
        { yPercent: 118, duration: 1.1, ease: "power4.out", stagger: 0.12 }, 0)
      .from(".hero-band", { yPercent: 100, duration: 0.9, ease: "power3.out" }, 0.45)
      .from(".hero-pause", { opacity: 0, duration: 0.6 }, 0.8)
      .add(() => { rotTl = initHeroRotator(); }, 0.9);
  }

  /* =========================================================
     4. SECTION HEADINGS — SplitText reveal on scroll
     ========================================================= */
  function initHeadings() {
    qa("[data-split]").forEach((el) => {
      if (reduced) { gsap.set(el, { opacity: 1 }); return; }
      const split = SplitText.create(el, { type: "lines, words", mask: "lines", linesClass: "line" });
      gsap.set(el, { opacity: 1 });
      gsap.from(split.words, {
        yPercent: 115,
        duration: 1,
        ease: "power4.out",
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 85%" }
      });
    });
  }

  /* =========================================================
     4b. INSIDE statement — masked word reveal (La Huella "Club Culture")
     ========================================================= */
  function initInsideStatement() {
    const el = q(".inside-statement");
    if (!el) return;
    if (reduced) { gsap.set(el, { opacity: 1 }); return; }
    const split = SplitText.create(el, { type: "words", mask: "words" });
    gsap.set(el, { opacity: 1 });
    gsap.from(split.words, {
      yPercent: -110,                 // each word drops in from above its clip box
      duration: 0.8, ease: "power3.out", stagger: 0.035,
      scrollTrigger: { trigger: el, start: "top 82%" }
    });
  }

  /* =========================================================
     5. GENERIC REVEALS  [data-reveal]
     ========================================================= */
  function initReveals() {
    if (reduced) { gsap.set("[data-reveal]", { opacity: 1, y: 0 }); return; }
    gsap.set("[data-reveal]", { opacity: 0, y: 40 });
    ScrollTrigger.batch("[data-reveal]", {
      start: "top 88%",
      onEnter: (els) => gsap.to(els, {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.08, overwrite: true
      })
    });
  }

  /* =========================================================
     6. PROGRAMS — two-column: hover/tap a program to swap the
        left image and expand its yellow panel
     ========================================================= */
  function initPrograms() {
    const items = qa(".prog-item");
    const imgs = qa(".pm-img");
    if (!items.length) return;

    const activate = (i) => {
      items.forEach((it, idx) => it.classList.toggle("is-active", idx === i));
      imgs.forEach((im, idx) => im.classList.toggle("is-active", idx === i));
    };

    items.forEach((it, i) => {
      const title = it.querySelector(".prog-item__title");
      if (!title) return;
      title.addEventListener("mouseenter", () => { if (isDesktop()) activate(i); });
      title.addEventListener("click", () => activate(i));
      title.addEventListener("focus", () => activate(i));
    });

    activate(0); // first program open by default
  }

  /* =========================================================
     7. MARQUEE — seamless loop, scroll-velocity reactive
     ========================================================= */
  function initMarquee() {
    const wrap = q("[data-marquee]");
    if (!wrap) return;
    const track = wrap.querySelector(".marquee__track");
    const oneSet = track.innerHTML;
    let sets = 1;
    // repeat content so it always overflows ~2x viewport (seamless)
    while (track.scrollWidth < window.innerWidth * 2.2) { track.innerHTML += oneSet; sets++; }
    const setWidth = track.scrollWidth / sets;

    const tween = gsap.to(track, {
      x: -setWidth,
      duration: setWidth / 90,
      ease: "none",
      repeat: -1
    });
    if (reduced) { tween.pause(); return; }

    // react to scroll velocity
    let resetTimer;
    ScrollTrigger.create({
      onUpdate: (self) => {
        const v = Math.min(Math.abs(self.getVelocity()) / 400, 4);
        gsap.to(tween, { timeScale: 1 + v, duration: 0.4, overwrite: true });
        clearTimeout(resetTimer);
        resetTimer = setTimeout(() => gsap.to(tween, { timeScale: 1, duration: 0.6 }), 120);
      }
    });
  }

  /* =========================================================
     8. SWIPER — ways to train
     ========================================================= */
  function initSwiper() {
    if (typeof Swiper === "undefined") return;
    new Swiper(".ways-swiper", {
      slidesPerView: 1.15,
      spaceBetween: 14,
      grabCursor: true,
      speed: 600,
      breakpoints: {
        640: { slidesPerView: 2.1, spaceBetween: 16 },
        1024: { slidesPerView: 3.2, spaceBetween: 20 },
        1280: { slidesPerView: 3.6, spaceBetween: 24 }
      }
    });
  }

  /* =========================================================
     9. LIGHTGALLERY
     ========================================================= */
  function initGallery() {
    const el = q("#lightgallery");
    if (!el || typeof lightGallery === "undefined") return;
    lightGallery(el, {
      selector: ".inside-img",
      plugins: [window.lgZoom, window.lgThumbnail].filter(Boolean),
      speed: 500,
      download: false,
      mobileSettings: { controls: false, showCloseIcon: true }
    });
  }

  /* =========================================================
     10. FAQ accordion
     ========================================================= */
  function initFaq() {
    qa(".faq-item").forEach((item) => {
      const btn = item.querySelector(".faq-q");
      const ans = item.querySelector(".faq-a");
      btn.addEventListener("click", () => {
        const isOpen = item.classList.contains("open");
        // close siblings for a tidy single-open accordion
        qa(".faq-item.open").forEach((other) => {
          if (other !== item) {
            other.classList.remove("open");
            gsap.to(other.querySelector(".faq-a"), { height: 0, duration: 0.45, ease: "power2.inOut" });
          }
        });
        if (isOpen) {
          item.classList.remove("open");
          gsap.to(ans, { height: 0, duration: 0.45, ease: "power2.inOut" });
        } else {
          item.classList.add("open");
          gsap.set(ans, { height: "auto" });
          gsap.from(ans, { height: 0, duration: 0.5, ease: "power2.out",
            onComplete: () => ScrollTrigger.refresh() });
        }
      });
    });

    const moreBtn = q("[data-faq-more]");
    if (moreBtn) {
      moreBtn.addEventListener("click", () => {
        const extras = qa(".faq-item.extra");
        const showing = extras[0] && extras[0].classList.contains("show");
        extras.forEach((e) => e.classList.toggle("show"));
        moreBtn.textContent = showing ? "Show more" : "Show less";
        ScrollTrigger.refresh();
      });
    }
  }

  /* =========================================================
     11. MENU OVERLAY
     ========================================================= */
  function initMenu() {
    const toggle = q(".menu-toggle");
    const overlay = q(".menu-overlay");
    const links = qa(".menu-overlay nav a");
    if (!toggle || !overlay) return;

    const tl = gsap.timeline({ paused: true });
    tl.set(overlay, { visibility: "visible" })
      .to(overlay, { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "power4.inOut" })
      .from(links, { yPercent: 120, opacity: 0, duration: 0.6, ease: "power3.out", stagger: 0.07 }, "-=0.3")
      .from(".menu-foot > *", { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 }, "-=0.4");

    let isOpen = false;
    const openMenu = () => { isOpen = true; document.body.classList.add("menu-open"); tl.timeScale(1).play(); };
    const closeMenu = () => {
      isOpen = false; document.body.classList.remove("menu-open");
      gsap.to(overlay, { clipPath: "inset(0 0 100% 0)", duration: 0.6, ease: "power4.inOut",
        onComplete: () => { gsap.set(overlay, { visibility: "hidden" }); tl.pause(0); } });
    };

    toggle.addEventListener("click", () => (isOpen ? closeMenu() : openMenu()));
    links.forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (id && id.startsWith("#")) {
        e.preventDefault();
        closeMenu();
        const t = q(id);
        if (t) gsap.delayedCall(0.45, () => scrollToTarget(t));
      }
    }));
  }

  /* =========================================================
     12. ANCHOR LINKS (header + footer) → smooth scroll
     ========================================================= */
  function initAnchors() {
    qa('a[href^="#"]:not([data-menu-link])').forEach((a) => {
      a.addEventListener("click", (e) => {
        const id = a.getAttribute("href");
        if (id.length < 2) return;
        const t = q(id);
        if (!t) return;
        e.preventDefault();
        scrollToTarget(t);
      });
    });
  }

  /* =========================================================
     13. HEADER hide-on-scroll-down
     ========================================================= */
  function initHeader() {
    const header = q(".site-header");
    if (!header) return;
    let last = 0;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        if (document.body.classList.contains("menu-open")) { header.classList.remove("header-hidden"); return; }
        if (y > last && y > 300) header.classList.add("header-hidden");
        else header.classList.remove("header-hidden");
        last = y;
      }
    });
  }

  /* =========================================================
     6b. MARK LINE — video expands from between the words
     ========================================================= */
  function initMarkline() {
    const sec = q(".markline"); if (!sec) return;
    const video = q(".ml-video");
    // sound toggle (video autoplays muted; let users unmute)
    const sound = q(".ml-sound");
    const vid = q(".ml-video video");
    if (sound && vid) {
      sound.addEventListener("click", () => {
        vid.muted = !vid.muted;
        sound.classList.toggle("is-on", !vid.muted);
        sound.setAttribute("aria-pressed", String(!vid.muted));
        sound.setAttribute("aria-label", vid.muted ? "Unmute video" : "Mute video");
        if (!vid.muted) vid.play().catch(() => {});
      });
    }
    // grow uniformly (keeps the 9:16 ratio), capped at ~85vh AND native 1280px so it never softens
    const maxScale = () => Math.min(window.innerHeight * 0.85, 1280) / (window.innerHeight * 0.26);
    if (reduced) { gsap.set(video, { scale: maxScale() }); gsap.set(".ml-text", { opacity: 0 }); gsap.set(".ml-cta", { opacity: 1 }); return; }
    const tl = gsap.timeline({
      scrollTrigger: { trigger: sec, start: "top top", end: "bottom bottom", scrub: 1, pin: ".markline__stage", anticipatePin: 1, invalidateOnRefresh: true }
    });
    tl.to(video, { scale: maxScale, ease: "none" }, 0)
      .to(".ml-text--top", { yPercent: -160, opacity: 0, ease: "none" }, 0)
      .to(".ml-text--bot", { yPercent: 160, opacity: 0, ease: "none" }, 0)
      .to(".ml-cta", { opacity: 1, ease: "none" }, 0.6);
  }

  /* =========================================================
     BOOT
     ========================================================= */
  function boot() {
    initSmoother();
    initHero();
    initHeadings();
    initInsideStatement();
    initReveals();
    initPrograms();
    initMarkline();
    initMarquee();
    initSwiper();
    initGallery();
    initFaq();
    initMenu();
    initAnchors();
    initHeader();
    // recalc once everything (incl. images/fonts) is settled
    ScrollTrigger.refresh();
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  // wait for the display font so SplitText measures correctly, then preloader → boot
  const start = () => runPreloader(boot);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(start);
    // safety: never block forever on font loading
    setTimeout(() => { if (!smoother && !reduced) { /* boot may already be running */ } }, 2500);
  } else {
    start();
  }
})();
