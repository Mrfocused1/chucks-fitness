/* =========================================================
   CHHUKS FITNESS — Booking flow logic
   ========================================================= */
(function () {
  "use strict";
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q = (s, c = document) => c.querySelector(s);
  const qa = (s, c = document) => Array.from(c.querySelectorAll(s));
  const hasG = typeof gsap !== "undefined";

  const steps = qa(".step");
  const stepperItems = qa(".stepper__item");
  const bars = qa(".stepper__bar");
  let cur = 0;

  const state = { session: null, sessionMeta: null, date: null, time: null, name: "", goal: null, level: null, note: "", auth: "signup" };

  const btnNext = q("#btnNext");
  const btnBack = q("#btnBack");

  /* ---------- step display ---------- */
  function paintStepper() {
    stepperItems.forEach((it, i) => {
      it.classList.toggle("active", i === cur);
      it.classList.toggle("done", i < cur);
    });
    bars.forEach((b, i) => b.classList.toggle("filled", i < cur));
    q("#stepNow").textContent = cur + 1;
  }

  function showStep(n, dir = 1) {
    steps.forEach((s, i) => s.classList.toggle("is-active", i === n));
    cur = n;
    paintStepper();
    updateNav();
    const el = steps[n];
    if (!reduced && hasG) {
      gsap.fromTo(el, { opacity: 0, x: dir > 0 ? 40 : -40 }, { opacity: 1, x: 0, duration: 0.45, ease: "power3.out" });
      gsap.fromTo(el.querySelectorAll(".step__head, .opt, .field, .cal, .slots-wrap, .auth-tabs, .social-row, .auth-divider, .auth-fine"),
        { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power3.out", delay: 0.05 });
    }
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  }

  /* ---------- validation per step ---------- */
  function stepValid(n) {
    if (n === 0) return !!state.session;
    if (n === 1) return !!state.date && !!state.time;
    if (n === 2) return state.name.trim().length > 1 && !!state.goal;
    if (n === 3) {
      const email = q("#aEmail").value.trim();
      const pass = q("#aPass").value.trim();
      const okName = state.auth === "login" || q("#aName").value.trim().length > 1;
      return /\S+@\S+\.\S+/.test(email) && pass.length >= 6 && okName;
    }
    return false;
  }
  function updateNav() {
    btnBack.classList.toggle("is-hidden", cur === 0);
    btnNext.textContent = cur === steps.length - 1 ? "Confirm booking" : "Continue";
    btnNext.disabled = !stepValid(cur);
  }

  btnNext.addEventListener("click", () => {
    if (!stepValid(cur)) return;
    if (cur === steps.length - 1) { confirmBooking(); return; }
    showStep(cur + 1, 1);
  });
  btnBack.addEventListener("click", () => { if (cur > 0) showStep(cur - 1, -1); });

  /* ---------- step 1: session ---------- */
  qa(".opt").forEach((opt) => {
    opt.addEventListener("click", () => {
      qa(".opt").forEach((o) => o.classList.remove("is-selected"));
      opt.classList.add("is-selected");
      state.session = opt.dataset.opt;
      state.sessionMeta = opt.dataset.meta;
      setSummary("sumSession", state.session);
      updateNav();
    });
  });

  /* ---------- step 2: calendar + slots ---------- */
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  const maxView = new Date(today.getFullYear(), today.getMonth() + 3, 1);

  function renderCal() {
    q("#calTitle").textContent = MONTHS[view.getMonth()] + " " + view.getFullYear();
    const grid = q("#calGrid"); grid.innerHTML = "";
    const first = new Date(view.getFullYear(), view.getMonth(), 1);
    let lead = (first.getDay() + 6) % 7; // Monday-first
    const dim = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
    for (let i = 0; i < lead; i++) { const e = document.createElement("div"); e.className = "cal-day is-empty"; grid.appendChild(e); }
    for (let d = 1; d <= dim; d++) {
      const cell = document.createElement("button");
      cell.className = "cal-day"; cell.textContent = d;
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const isPast = date < today;
      const isSun = date.getDay() === 0; // closed Sundays
      if (date.getTime() === today.getTime()) cell.classList.add("is-today");
      if (isPast || isSun) { cell.classList.add("is-disabled"); }
      else {
        cell.addEventListener("click", () => {
          qa(".cal-day").forEach((c) => c.classList.remove("is-selected"));
          cell.classList.add("is-selected");
          state.date = date; state.time = null;
          setSummary("sumDate", date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }));
          setSummary("sumTime", "—", true);
          renderSlots(date);
          updateNav();
        });
      }
      if (state.date && date.getTime() === state.date.getTime()) cell.classList.add("is-selected");
      grid.appendChild(cell);
    }
    q("#calPrev").disabled = (view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth());
    q("#calNext").disabled = (view.getFullYear() === maxView.getFullYear() && view.getMonth() === maxView.getMonth());
  }
  q("#calPrev").addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); });
  q("#calNext").addEventListener("click", () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); });

  function renderSlots(date) {
    const wrap = q("#slots"); wrap.innerHTML = "";
    const times = ["06:00","07:00","08:00","09:00","12:00","13:00","17:00","18:00","19:00","20:00"];
    const grid = document.createElement("div"); grid.className = "slots";
    times.forEach((t, i) => {
      const s = document.createElement("button");
      s.className = "slot"; s.textContent = t;
      // deterministically "book out" some slots
      const taken = ((date.getDate() + i) % 4 === 0);
      if (taken) { s.classList.add("is-disabled"); }
      else {
        s.addEventListener("click", () => {
          qa(".slot").forEach((x) => x.classList.remove("is-selected"));
          s.classList.add("is-selected");
          state.time = t; setSummary("sumTime", t); updateNav();
        });
      }
      if (state.time === t) s.classList.add("is-selected");
      grid.appendChild(s);
    });
    wrap.appendChild(grid);
  }

  /* ---------- step 3: details ---------- */
  q("#fName").addEventListener("input", (e) => { state.name = e.target.value; updateNav(); });
  q("#fNote").addEventListener("input", (e) => { state.note = e.target.value; });
  qa('[data-chips]').forEach((row) => {
    const key = row.dataset.chips;
    row.querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        row.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-selected"));
        chip.classList.add("is-selected");
        state[key] = chip.dataset.val;
        if (key === "goal") setSummary("sumGoal", chip.dataset.val);
        updateNav();
      });
    });
  });

  /* ---------- step 4: auth ---------- */
  qa(".auth-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      qa(".auth-tab").forEach((t) => t.classList.remove("is-active"));
      tab.classList.add("is-active");
      state.auth = tab.dataset.auth;
      q("[data-signup-only]").style.display = state.auth === "login" ? "none" : "";
      q(".step[data-step='3'] .step__head h2").textContent = state.auth === "login" ? "Welcome back" : "Almost there";
      updateNav();
    });
  });
  ["#aName", "#aEmail", "#aPass"].forEach((sel) => q(sel).addEventListener("input", updateNav));

  /* ---------- summary ---------- */
  function setSummary(id, val, empty) {
    const el = q("#" + id); if (!el) return;
    el.textContent = val;
    el.classList.toggle("empty", !!empty);
  }
  qa(".sum-row[data-goto]").forEach((row) => {
    row.style.cursor = "pointer";
    row.addEventListener("click", () => showStep(parseInt(row.dataset.goto, 10), -1));
  });

  /* ---------- confirm ---------- */
  function confirmBooking() {
    const d = state.date.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });
    q("#successSummary").innerHTML =
      `<div class="sum-row"><span class="sum-k">Session</span><span class="sum-v">${state.session}</span></div>` +
      `<div class="sum-row"><span class="sum-k">When</span><span class="sum-v">${d} · ${state.time}</span></div>` +
      `<div class="sum-row"><span class="sum-k">Goal</span><span class="sum-v">${state.goal || "—"}</span></div>`;
    q(".stepper").style.display = "none";
    steps.forEach((s) => s.classList.remove("is-active"));
    q("#bkNav").style.display = "none";
    const su = q("#bkSuccess"); su.classList.add("is-active");
    if (!reduced && hasG) {
      gsap.from(su.querySelector(".tick"), { scale: 0, rotate: -30, duration: 0.6, ease: "back.out(1.7)" });
      gsap.from(su.querySelectorAll("h2, p, .sum-card, .btn"), { opacity: 0, y: 24, duration: 0.6, stagger: 0.08, ease: "power3.out", delay: 0.15 });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- boot ---------- */
  renderCal();
  paintStepper();
  updateNav();
  if (!reduced && hasG) {
    gsap.from(".bk-header", { y: -30, opacity: 0, duration: 0.6, ease: "power3.out" });
    gsap.from(".stepper", { opacity: 0, y: 20, duration: 0.6, ease: "power3.out", delay: 0.1 });
    gsap.from(steps[0].querySelectorAll(".step__head, .opt"), { opacity: 0, y: 22, duration: 0.5, stagger: 0.06, ease: "power3.out", delay: 0.2 });
    gsap.from(".bk-summary", { opacity: 0, x: 30, duration: 0.6, ease: "power3.out", delay: 0.2 });
  }
})();
