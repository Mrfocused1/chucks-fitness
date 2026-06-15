/* =========================================================
   CHHUKS FITNESS — Contact form
   ========================================================= */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q = (s) => document.querySelector(s);
  const hasG = typeof gsap !== "undefined";

  const form = q("#contactForm");
  const send = q("#cSend");
  const name = q("#cName"), email = q("#cEmail"), msg = q("#cMsg");

  function valid() {
    return name.value.trim().length > 1 &&
      /\S+@\S+\.\S+/.test(email.value.trim()) &&
      msg.value.trim().length > 4;
  }
  function refresh() { send.disabled = !valid(); }
  [name, email, msg].forEach((el) => el.addEventListener("input", refresh));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!valid()) return;
    const su = q("#contactSuccess");
    su.classList.add("is-active");
    if (!reduced && hasG) {
      gsap.from(su.querySelector(".tick"), { scale: 0, rotate: -30, duration: 0.6, ease: "back.out(1.7)" });
      gsap.from(su.querySelectorAll("h2, p"), { opacity: 0, y: 20, duration: 0.5, stagger: 0.1, ease: "power3.out", delay: 0.15 });
    }
  });

  // entrance
  if (!reduced && hasG) {
    gsap.from(".bk-header", { y: -30, opacity: 0, duration: 0.6, ease: "power3.out" });
    gsap.from(".contact-info h1", { opacity: 0, y: 30, duration: 0.7, ease: "power3.out", delay: 0.1 });
    gsap.from(".contact-info .lead, .contact-list .row, .contact-socials", { opacity: 0, y: 22, duration: 0.6, stagger: 0.06, ease: "power3.out", delay: 0.2 });
    gsap.from(".contact-form", { opacity: 0, y: 30, duration: 0.7, ease: "power3.out", delay: 0.25 });
  }
})();
