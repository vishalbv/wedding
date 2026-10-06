const wedding = {
  bride:     "Deeksha",
  groom:     "Vishal",
  date:      "2026-11-15T11:51:00+05:30",
  dateLabel: "Sunday, 15 November 2026",
  timeline: [
    { title: "Puja & Muhurtham",  detail: "15 November · 11:51 AM · Shri Chennakeshava Temple, Honnavar" },
    { title: "Wedding Ceremony",  detail: "15 November · 12:30 PM · Seeking blessings together" },
    { title: "Reception",         detail: "16 November · 12:00 PM onwards · Billodi, Hosnagara, Shivamogga" }
  ],
  events: [
    { name: "Mehendi",  when: "13 November 2026 · 4:00 PM",  where: "At the bride's home" },
    { name: "Haldi",    when: "14 November 2026 · 10:00 AM", where: "At respective homes"  },
    { name: "Sangeet",  when: "14 November 2026 · 7:00 PM",  where: "Family celebration"   }
  ]
};

/* ── DOM REFS ─────────────────────────────────────────────── */
const bgVideo     = document.getElementById("bgVideo");
const videoDim    = document.getElementById("videoDim");
const tapScreen   = document.getElementById("tapScreen");
const tapInner    = tapScreen.querySelector(".tap-inner");
const mainContent = document.getElementById("mainContent");
const heroInner   = document.getElementById("heroInner");
const scrollCue   = document.getElementById("scrollCue");

/* ── STATE ────────────────────────────────────────────────── */
let videoStarted  = false;
let contentShown  = false;

/* ── TAP TO PLAY ──────────────────────────────────────────── */
tapScreen.addEventListener("click", () => {
  if (videoStarted) return;
  videoStarted = true;
  // Start video immediately on tap
  bgVideo.play().catch(() => showContent());
  // Dissolve the DV monogram 2 seconds after tap
  setTimeout(() => tapInner.classList.add("dissolve"), 2000);
  // Start wedding music (requires user gesture for AudioContext)
  if (window.initWeddingMusic) window.initWeddingMusic();
});

/* ── VIDEO → CONTENT REVEAL ───────────────────────────────── */
function showContent() {
  if (contentShown) return;
  contentShown = true;

  // dim the video slightly for readability
  videoDim.classList.add("content-mode");

  // fade out tap screen
  tapScreen.classList.add("exit");

  // reveal the invitation content
  mainContent.classList.add("visible");
  mainContent.removeAttribute("aria-hidden");

  // hero text fades in a beat after the content wrapper
  setTimeout(() => heroInner.classList.add("visible"), 300);

  // Repaint scratch canvas — it ran at page load when the section was hidden
  // (opacity:0 elements can have 0 canvas rect), so repaint once layout is live
  setTimeout(() => { if (!revealed) paintCover(); }, 700);
}

bgVideo.addEventListener("timeupdate", () => {
  if (!bgVideo.duration) return;
  if (bgVideo.currentTime / bgVideo.duration >= 0.72) showContent();
});

bgVideo.addEventListener("ended", showContent);

/* ── SCROLL CUE ───────────────────────────────────────────── */
scrollCue.addEventListener("click", () => {
  document.getElementById("welcome").scrollIntoView({ behavior: "smooth" });
});

/* ── COUNTDOWN ────────────────────────────────────────────── */
function pad(n) { return String(n).padStart(2, "0"); }

function tick() {
  const diff = Math.max(0, new Date(wedding.date).getTime() - Date.now());
  const units = {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff / 3600000)  % 24),
    minutes: Math.floor((diff / 60000)    % 60),
    seconds: Math.floor((diff / 1000)     % 60)
  };
  document.querySelectorAll("[data-unit]").forEach(
    (el) => (el.textContent = pad(units[el.dataset.unit]))
  );
}
tick();
setInterval(tick, 1000);

/* ── SAVE THE DATE ────────────────────────────────────────── */
const cal = new URL("https://calendar.google.com/calendar/render");
cal.searchParams.set("action",   "TEMPLATE");
cal.searchParams.set("text",     `${wedding.bride} & ${wedding.groom} — Wedding`);
cal.searchParams.set("dates",    "20261115T115100/20261115T150000");
cal.searchParams.set("location", "Shri Chennakeshava Temple, Kangodu, Honnavar, Karnataka");
cal.searchParams.set("details",  "You are invited. Details on the digital invitation.");
document.getElementById("saveDate").href = cal.toString();

/* ── TIMELINE & EVENTS ────────────────────────────────────── */
document.getElementById("timelineList").innerHTML = wedding.timeline
  .map((e) => `<li><h3>${e.title}</h3><p>${e.detail}</p></li>`)
  .join("");

const eventsListEl = document.getElementById("eventsList");
if (eventsListEl) eventsListEl.innerHTML = wedding.events
  .map((e) => `<article><h3>${e.name}</h3><time>${e.when}</time><p>${e.where}</p></article>`)
  .join("");

/* ── SCRATCH CARD ─────────────────────────────────────────── */
const canvas     = document.getElementById("scratchCanvas");
const scratch    = document.getElementById("scratch");
const hintEl     = document.getElementById("scratchHint");
const ctx        = canvas.getContext("2d");
let scratching   = false;
let revealed     = false;

function heartPath(w, h) {
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.9);
  ctx.bezierCurveTo(w * 0.1, h * 0.62, w * 0.02, h * 0.38, w * 0.16, h * 0.24);
  ctx.bezierCurveTo(w * 0.26, h * 0.12, w * 0.4, h * 0.14, w * 0.5, h * 0.3);
  ctx.bezierCurveTo(w * 0.6, h * 0.14, w * 0.74, h * 0.12, w * 0.84, h * 0.24);
  ctx.bezierCurveTo(w * 0.98, h * 0.38, w * 0.9, h * 0.62, w * 0.5, h * 0.9);
  ctx.closePath();
}

function paintCover() {
  ctx.globalCompositeOperation = "source-over";
  const rect  = canvas.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;
  canvas.width  = rect.width  * ratio;
  canvas.height = rect.height * ratio;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  const { width: w, height: h } = rect;
  heartPath(w, h);
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0,    "#fbe5d6");
  g.addColorStop(0.45, "#c98b6e");
  g.addColorStop(1,    "#6e3c2a");
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  for (let i = 0; i < 90; i++) {
    ctx.fillStyle = `rgba(255,236,220,${Math.random() * 0.45})`;
    ctx.beginPath();
    ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  ctx.globalCompositeOperation = "source-over";
}

function scratchAt(e) {
  const { left, top } = canvas.getBoundingClientRect();
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(e.clientX - left, e.clientY - top, 18, 0, Math.PI * 2);
  ctx.fill();
}

function enoughScratched() {
  const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let clear = 0, total = 0;
  for (let i = 3; i < d.length; i += 32) { total++; if (d[i] < 40) clear++; }
  return clear / total > 0.42;
}

function finishScratch() {
  if (revealed) return;
  revealed = true;
  scratch.classList.add("is-done");
  if (hintEl) hintEl.classList.add("hidden"); // fade out the inside-heart hint
  // Reveal timer smoothly after scratch
  const cr = document.getElementById("countdownReveal");
  if (cr) setTimeout(() => cr.classList.add("visible"), 250);
}

canvas.addEventListener("pointerdown", (e) => {
  scratching = true;
  canvas.setPointerCapture(e.pointerId);
  scratchAt(e);
  if (hintEl) hintEl.classList.add("hidden"); // hide hint immediately on first touch
});
canvas.addEventListener("pointermove", (e) => { if (!scratching) return; scratchAt(e); if (enoughScratched()) finishScratch(); });
canvas.addEventListener("pointerup",   ()  => { scratching = false; if (enoughScratched()) finishScratch(); });
window.addEventListener("resize",      ()  => { if (!revealed) paintCover(); });
paintCover();

/* ── RSVP (guarded — section may be removed) ─────────────── */
const form = document.getElementById("rsvpForm");
if (form) {
  const thanksEl  = document.getElementById("thanks");
  const storageKey = "dv-wedding-rsvp-2026";
  function showThanks(show) { form.hidden = show; thanksEl.hidden = !show; }
  if (localStorage.getItem(storageKey)) showThanks(true);
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem(storageKey, JSON.stringify(Object.fromEntries(new FormData(form))));
    showThanks(true);
  });
  const editBtn = document.getElementById("editReply");
  if (editBtn) editBtn.addEventListener("click", () => {
    const data = JSON.parse(localStorage.getItem(storageKey) || "{}");
    Object.entries(data).forEach(([k, v]) => { if (form.elements[k]) form.elements[k].value = v; });
    showThanks(false);
  });
}

/* ── MOUSE ORB ────────────────────────────────────────────── */
const mouseOrb = document.getElementById("mouseOrb");

document.addEventListener("mousemove", (e) => {
  mouseOrb.style.left = e.clientX + "px";
  mouseOrb.style.top  = e.clientY + "px";
  if (heroInner.classList.contains("visible")) {
    const x = (e.clientX / window.innerWidth  - 0.5) * 16;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    heroInner.style.transform = `translate(${x}px, ${y}px)`;
  }
});

/* ── HERO PARTICLES ───────────────────────────────────────── */
const heroParticles = document.getElementById("heroParticles");
for (let i = 0; i < 24; i++) {
  const p = document.createElement("span");
  const size = 1.5 + Math.random() * 2.5;
  p.style.cssText = `
    left: ${Math.random() * 100}%;
    width: ${size}px;
    height: ${size}px;
    animation-delay: ${Math.random() * 7}s;
    animation-duration: ${4 + Math.random() * 5}s;
  `;
  heroParticles.appendChild(p);
}

/* ── SCROLL REVEAL ────────────────────────────────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("revealed");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(
  ".section h2, .dual-cell, .timeline li, .venue-card, " +
  ".frames figure, .welcome p, .script-title, .lede, .eyebrow"
).forEach((el) => {
  el.classList.add("will-reveal");
  revealObserver.observe(el);
});

/* Enable parallax smoothly after hero animation completes */
setTimeout(() => {
  if (heroInner.style) heroInner.style.transition = "transform 0.18s ease-out";
}, 2500);

/* ── WEDDING MUSIC ────────────────────────────────────────── */
(function () {
  const audio = new Audio("assets/ss.mp3");
  audio.loop   = true;
  audio.volume = 0;
  let muted = false, started = false;

  function fadeIn() {
    let v = 0;
    const step = () => {
      v = Math.min(v + 0.01, 0.55);
      audio.volume = v;
      if (v < 0.55) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  window.initWeddingMusic = function () {
    if (started) return;
    started = true;
    audio.play().then(() => {
      fadeIn();
      const btn = document.getElementById("muteBtn");
      if (btn) setTimeout(() => btn.classList.add("active"), 1400);
    }).catch(e => console.warn("Audio play failed:", e));
  };

  const btn = document.getElementById("muteBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      muted = !muted;
      btn.dataset.muted = muted;
      btn.setAttribute("aria-label", muted ? "Unmute music" : "Mute music");
      audio.volume = muted ? 0 : 0.55;
    });
  }
})();
