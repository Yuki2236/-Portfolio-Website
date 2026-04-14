/* ═══════════════════════════════════════════════════
   YUKESH.Rk Portfolio - main.js
   Interactions, animations, particles
═══════════════════════════════════════════════════ */

/* ─── Typed Text ─── */
const phrases = [
  "Web Developer",
  "Frontend Enthusiast",
  "AI & DS Student",
  "JavaScript Developer",
  "Problem Solver"
];
let phraseIndex = 0, charIndex = 0, isDeleting = false;

function typeWriter() {
  const el = document.getElementById("typedText");
  if (!el) return;
  const current = phrases[phraseIndex];
  el.textContent = isDeleting
    ? current.slice(0, charIndex - 1)
    : current.slice(0, charIndex + 1);
  charIndex += isDeleting ? -1 : 1;
  let delay = isDeleting ? 50 : 95;
  if (!isDeleting && charIndex === current.length) {
    delay = 1800;
    isDeleting = true;
  } else if (isDeleting && charIndex === 0) {
    isDeleting = false;
    phraseIndex = (phraseIndex + 1) % phrases.length;
    delay = 400;
  }
  setTimeout(typeWriter, delay);
}
typeWriter();

/* ─── Cursor Glow ─── */
const glow = document.getElementById("cursorGlow");
let mx = window.innerWidth / 2, my = window.innerHeight / 2;
let cx = mx, cy = my;

document.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; });

function animateCursor() {
  cx += (mx - cx) * 0.08;
  cy += (my - cy) * 0.08;
  if (glow) glow.style.cssText = `left:${cx}px;top:${cy}px;`;
  requestAnimationFrame(animateCursor);
}
animateCursor();

/* ─── Particle Canvas ─── */
const canvas  = document.getElementById("particleCanvas");
const ctx     = canvas.getContext("2d");
let particles = [];
let W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

class Particle {
  constructor() { this.reset(); }
  reset() {
    this.x    = Math.random() * W;
    this.y    = Math.random() * H;
    this.vx   = (Math.random() - 0.5) * 0.4;
    this.vy   = (Math.random() - 0.5) * 0.4;
    this.r    = Math.random() * 1.5 + 0.3;
    this.alpha = Math.random() * 0.5 + 0.1;
    const hues = [195, 270, 210];
    this.hue  = hues[Math.floor(Math.random() * hues.length)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
  }
  draw() {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle   = `hsl(${this.hue}, 90%, 70%)`;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

for (let i = 0; i < 80; i++) particles.push(new Particle());

function drawConnections() {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        ctx.save();
        ctx.globalAlpha = (1 - dist / 100) * 0.12;
        ctx.strokeStyle = `hsl(195, 90%, 70%)`;
        ctx.lineWidth   = 0.5;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.stroke();
        ctx.restore();
      }
    }
  }
}

function animateParticles() {
  ctx.clearRect(0, 0, W, H);
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();
  requestAnimationFrame(animateParticles);
}
animateParticles();

/* ─── Navbar scroll + active link ─── */
const navbar   = document.getElementById("navbar");
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", () => {
  if (window.scrollY > 40) navbar.classList.add("scrolled");
  else                      navbar.classList.remove("scrolled");

  // active link detection
  let current = "";
  sections.forEach(sec => {
    const top = sec.offsetTop - 90;
    if (window.scrollY >= top) current = sec.getAttribute("id");
  });
  navLinks.forEach(a => {
    a.classList.toggle("active", a.getAttribute("href") === "#" + current);
  });
});

/* ─── Hamburger ─── */
const hamburger = document.getElementById("hamburger");
hamburger.addEventListener("click", () => {
  navbar.classList.toggle("mobile-open");
});
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => navbar.classList.remove("mobile-open"));
});

/* ─── Reveal animations (Intersection Observer) ─── */
const revealEls = [];

function addReveal(selector, cls = "reveal") {
  document.querySelectorAll(selector).forEach((el, i) => {
    el.classList.add(cls);
    el.style.transitionDelay = `${i * 0.08}s`;
    revealEls.push(el);
  });
}

addReveal(".section-header");
addReveal(".about-text", "reveal-left");
addReveal(".strengths-card", "reveal-right");
addReveal(".about-info-item");
addReveal(".skill-category");
addReveal(".project-card");
addReveal(".edu-card");
addReveal(".cert-card");
addReveal(".contact-info", "reveal-left");
addReveal(".contact-form", "reveal-right");
addReveal(".hero-content");
addReveal(".hero-visual");

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
);
revealEls.forEach(el => observer.observe(el));

/* ─── Skill bars animation ─── */
const barObserver = new IntersectionObserver(
  entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll(".skill-bar-fill").forEach(bar => {
          bar.style.width = bar.dataset.width + "%";
        });
        barObserver.unobserve(e.target);
      }
    });
  },
  { threshold: 0.3 }
);
document.querySelectorAll(".skill-category").forEach(el => barObserver.observe(el));

/* ─── Contact Form ─── */
function handleFormSubmit(e) {
  e.preventDefault();
  const btn = document.getElementById("formSubmit");
  const success = document.getElementById("formSuccess");
  btn.textContent = "Sending…";
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = "Send Message 🚀";
    btn.disabled = false;
    success.classList.add("show");
    e.target.reset();
    setTimeout(() => success.classList.remove("show"), 5000);
  }, 1200);
}

/* ─── Smooth hero badge pulse ─── */
setTimeout(() => {
  const badge = document.getElementById("heroBadge");
  if (badge) {
    badge.style.animation = "none";
    badge.style.opacity   = "1";
  }
}, 100);

console.log(
  "%c YUKESH.Rk Portfolio %c Built with ❤️ using HTML, CSS & JavaScript ",
  "background:#00d4ff;color:#000;font-weight:900;padding:6px 12px;border-radius:4px 0 0 4px;",
  "background:#080b14;color:#00d4ff;padding:6px 12px;border-radius:0 4px 4px 0;border:1px solid #00d4ff;"
);
