/* ═══════════════════════════════════════════════════
   YUKESH.Rk Portfolio – auth.js
   User Account System (localStorage-based)
═══════════════════════════════════════════════════ */

/* ─── Storage helpers ─── */
const DB_KEY     = "yk_users";
const SESSION_KEY = "yk_session";

function getUsers()       { return JSON.parse(localStorage.getItem(DB_KEY)     || "[]"); }
function getSession()     { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
function saveSession(u)   { localStorage.setItem(SESSION_KEY, JSON.stringify(u)); }
function clearSession()   { localStorage.removeItem(SESSION_KEY); }
function saveUsers(users) { localStorage.setItem(DB_KEY, JSON.stringify(users)); }

/* Simple hash (not cryptographic — demo only) */
function hashPass(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash.toString(16);
}

/* Initials from name */
function initials(name) {
  return name.trim().split(/\s+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

/* ─── DOM refs ─── */
const authOverlay  = document.getElementById("authOverlay");
const authClose    = document.getElementById("authClose");
const navSignIn    = document.getElementById("navSignIn");
const userMenu     = document.getElementById("userMenu");
const navAvatar    = document.getElementById("navAvatar");
const navUsername  = document.getElementById("navUsername");
const userDropdown = document.getElementById("userDropdown");
const udAvatar     = document.getElementById("udAvatar");
const udName       = document.getElementById("udName");
const udEmail      = document.getElementById("udEmail");

const dashOverlay  = document.getElementById("dashOverlay");
const dashboard    = document.getElementById("userDashboard");
const dashClose    = document.getElementById("dashClose");
const dashAvatar   = document.getElementById("dashAvatar");
const dashName     = document.getElementById("dashName");
const dashEmail    = document.getElementById("dashEmail");
const dashJoined   = document.getElementById("dashJoined");
const dashVisits   = document.getElementById("dashVisits");
const dashNoteSaved = document.getElementById("dashNoteSaved");

/* ─── Init: restore session ─── */
(function init() {
  const session = getSession();
  if (session) {
    applyLoggedIn(session);
    // increment visit count
    const users = getUsers();
    const idx   = users.findIndex(u => u.email === session.email);
    if (idx !== -1) {
      users[idx].visits = (users[idx].visits || 0) + 1;
      saveUsers(users);
      saveSession(users[idx]);
    }
  }

  // Restore dashboard note
  const note = localStorage.getItem("yk_note_" + (session ? session.email : ""));
  if (note && document.getElementById("dashNote")) {
    document.getElementById("dashNote").value = note;
  }
})();

/* ─── Open/close auth modal ─── */
window.openAuthModal = function(tab = "login") {
  authOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
  switchTab(tab);
};

authClose.addEventListener("click", closeAuthModal);
authOverlay.addEventListener("click", e => {
  if (e.target === authOverlay) closeAuthModal();
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeAuthModal();
    closeDashboard();
  }
});

function closeAuthModal() {
  authOverlay.classList.remove("open");
  document.body.style.overflow = "";
  clearFormErrors();
}

/* ─── Tab switching ─── */
window.switchTab = function(tab) {
  const tabs   = document.querySelectorAll(".auth-tab");
  const panels = document.querySelectorAll(".auth-panel");
  tabs.forEach(t   => t.classList.toggle("active", t.dataset.tab === tab));
  panels.forEach(p => p.classList.toggle("hidden", p.id !== "panel" + capitalize(tab)));
  clearFormErrors();
};

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function clearFormErrors() {
  document.querySelectorAll(".auth-error").forEach(el => el.textContent = "");
}

/* ─── Register ─── */
window.handleSignup = function(e) {
  e.preventDefault();
  const name     = document.getElementById("signupName").value.trim();
  const email    = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const confirm  = document.getElementById("signupConfirm").value;
  const errEl    = document.getElementById("signupError");

  if (!name || !email || !password || !confirm) {
    return showError(errEl, "Please fill in all fields.");
  }
  if (!isValidEmail(email)) {
    return showError(errEl, "Please enter a valid email address.");
  }
  if (password.length < 6) {
    return showError(errEl, "Password must be at least 6 characters.");
  }
  if (password !== confirm) {
    return showError(errEl, "Passwords do not match.");
  }

  const users = getUsers();
  if (users.find(u => u.email === email)) {
    return showError(errEl, "An account with this email already exists.");
  }

  const newUser = {
    name,
    email,
    password: hashPass(password),
    joined:   new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" }),
    visits:   1
  };
  users.push(newUser);
  saveUsers(users);
  saveSession(newUser);

  closeAuthModal();
  applyLoggedIn(newUser);
  showToast("🎉 Account created! Welcome, " + name.split(" ")[0] + "!");
};

/* ─── Login ─── */
window.handleLogin = function(e) {
  e.preventDefault();
  const email    = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const errEl    = document.getElementById("loginError");

  if (!email || !password) {
    return showError(errEl, "Please fill in all fields.");
  }

  const users = getUsers();
  const user  = users.find(u => u.email === email && u.password === hashPass(password));

  if (!user) {
    return showError(errEl, "Incorrect email or password.");
  }

  // update visits
  const idx = users.indexOf(user);
  users[idx].visits = (user.visits || 0) + 1;
  saveUsers(users);
  saveSession(users[idx]);

  closeAuthModal();
  applyLoggedIn(users[idx]);
  showToast("👋 Welcome back, " + user.name.split(" ")[0] + "!");
};

/* ─── Logout ─── */
window.handleLogout = function() {
  clearSession();
  applyLoggedOut();
  closeDashboard();
  showToast("👋 You've been signed out.");
};

/* ─── Apply UI state ─── */
function applyLoggedIn(user) {
  const ini = initials(user.name);

  // Navbar
  navSignIn.style.display  = "none";
  userMenu.style.display   = "flex";
  navAvatar.textContent    = ini;
  navUsername.textContent  = user.name.split(" ")[0];

  // Dropdown header
  udAvatar.textContent = ini;
  udName.textContent   = user.name;
  udEmail.textContent  = user.email;

  // Dashboard
  dashAvatar.textContent = ini;
  dashName.textContent   = user.name;
  dashEmail.textContent  = user.email;
  dashJoined.textContent = user.joined || "—";
  dashVisits.textContent = user.visits || 1;

  // Restore note
  const savedNote = localStorage.getItem("yk_note_" + user.email);
  if (savedNote && document.getElementById("dashNote")) {
    document.getElementById("dashNote").value = savedNote;
  }
}

function applyLoggedOut() {
  navSignIn.style.display = "";
  userMenu.style.display  = "none";
  navAvatar.textContent   = "";
  navUsername.textContent = "";
  closeDropdown();
}

/* ─── Dashboard slide panel ─── */
window.openDashboard = function() {
  closeDropdown();
  dashboard.classList.add("open");
  dashOverlay.classList.add("open");
  document.body.style.overflow = "hidden";
};

window.closeDashboard = function() {
  dashboard.classList.remove("open");
  dashOverlay.classList.remove("open");
  document.body.style.overflow = "";
};

dashClose.addEventListener("click", closeDashboard);
dashOverlay.addEventListener("click", closeDashboard);

/* ─── Dropdown toggle ─── */
document.getElementById("userAvatarBtn").addEventListener("click", function(e) {
  e.stopPropagation();
  openDashboard();
});

window.closeDropdown = function() {
  userDropdown.classList.remove("open");
};

document.addEventListener("click", e => {
  if (!userMenu.contains(e.target)) closeDropdown();
});

/* ─── Dashboard note ─── */
window.saveDashNote = function(e) {
  e.preventDefault();
  const session = getSession();
  const note    = document.getElementById("dashNote").value;
  if (!session) return;
  localStorage.setItem("yk_note_" + session.email, note);
  dashNoteSaved.classList.add("show");
  setTimeout(() => dashNoteSaved.classList.remove("show"), 2500);
};

/* ─── Password visibility toggles ─── */
setupTogglePw("toggleLoginPw",  "loginPassword");
setupTogglePw("toggleSignupPw", "signupPassword");

function setupTogglePw(btnId, inputId) {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener("click", () => {
    const input = document.getElementById(inputId);
    if (!input) return;
    const isText = input.type === "text";
    input.type   = isText ? "password" : "text";
    btn.textContent = isText ? "👁" : "🙈";
  });
}

/* ─── Utilities ─── */
function showError(el, msg) {
  el.textContent = msg;
  el.closest(".auth-panel, form").querySelector("input")?.focus();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Toast notification */
function showToast(message) {
  let toast = document.getElementById("ykToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ykToast";
    toast.style.cssText = `
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(80px);
      background:rgba(13,17,32,0.96); border:1px solid rgba(0,212,255,0.3);
      backdrop-filter:blur(16px); color:#f0f4ff; padding:12px 24px;
      border-radius:100px; font-size:0.9rem; font-weight:600;
      box-shadow:0 8px 32px rgba(0,0,0,0.4); z-index:9999;
      transition:transform 0.4s cubic-bezier(0.22,1,0.36,1), opacity 0.4s;
      opacity:0; font-family:'Inter',sans-serif; white-space:nowrap;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.transform = "translateX(-50%) translateY(80px)";
  toast.style.opacity   = "0";
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      toast.style.transform = "translateX(-50%) translateY(0)";
      toast.style.opacity   = "1";
    });
  });
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.transform = "translateX(-50%) translateY(80px)";
    toast.style.opacity   = "0";
  }, 3200);
}
