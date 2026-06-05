document.body.classList.add("has-js", "is-loading");

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

const loader = document.querySelector("[data-loader]");
const loaderButton = document.querySelector("[data-loader-button]");
const header = document.querySelector("[data-header]");
const scrollBar = document.querySelector(".scroll-meter span");
const menuButton = document.querySelector("[data-menu-button]");
const nav = document.querySelector("[data-nav]");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const sceneIndex = document.querySelector("[data-scene-index]");
const sceneLabel = document.querySelector("[data-scene-label]");
const hudScene = document.querySelector("[data-hud-scene]");
const hudSignal = document.querySelector("[data-hud-signal]");
const hudMode = document.querySelector("[data-hud-mode]");
const audioToggle = document.querySelector("[data-audio-toggle]");
const directorToggle = document.querySelector("[data-director-toggle]");
const launchOverlay = document.querySelector("[data-launch-overlay]");
const launchCount = document.querySelector("[data-launch-count]");
const launchButton = document.querySelector("[data-launch-sequence]");

function hideLoader() {
  loader.classList.add("is-hidden");
  document.body.classList.remove("is-loading");
}

loaderButton.addEventListener("click", hideLoader);
window.addEventListener("load", () => window.setTimeout(hideLoader, 1500));

function updateScrollState() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const progress = max > 0 ? (window.scrollY / max) * 100 : 0;
  scrollBar.style.width = `${progress}%`;
  header.classList.toggle("is-scrolled", window.scrollY > 20);
  hudSignal.textContent = `${String(Math.round(92 + progress / 12)).padStart(2, "0")}%`;
}

updateScrollState();
window.addEventListener("scroll", updateScrollState, { passive: true });

menuButton.addEventListener("click", () => {
  const open = menuButton.classList.toggle("is-open");
  nav.classList.toggle("is-open", open);
  document.body.classList.toggle("menu-open", open);
  menuButton.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuButton.classList.remove("is-open");
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  });
});

const scenes = [...document.querySelectorAll(".scene")];
const sceneObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    sceneIndex.textContent = entry.target.dataset.scene || "00";
    sceneLabel.textContent = entry.target.dataset.label || "Cena";
    hudScene.textContent = `${entry.target.dataset.scene || "00"} / ${entry.target.dataset.label || "Cena"}`;
    navLinks.forEach((link) => {
      const target = document.querySelector(link.getAttribute("href"));
      link.classList.toggle("is-active", target === entry.target);
    });
  });
}, { rootMargin: "-34% 0px -52% 0px", threshold: 0.01 });

scenes.forEach((scene) => sceneObserver.observe(scene));

let audioEnabled = false;
let audioContext;

function playTone(frequency = 240, duration = 0.08, type = "sine", gainValue = 0.035) {
  if (!audioEnabled) return;
  audioContext ||= new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.value = gainValue;
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + duration);
  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
}

audioToggle.addEventListener("click", async () => {
  audioContext ||= new AudioContext();
  if (audioContext.state === "suspended") await audioContext.resume();
  audioEnabled = !audioEnabled;
  audioToggle.textContent = audioEnabled ? "Som on" : "Som off";
  audioToggle.classList.toggle("is-active", audioEnabled);
  if (audioEnabled) {
    playTone(180, 0.08, "sawtooth", 0.025);
    window.setTimeout(() => playTone(360, 0.1, "triangle", 0.03), 90);
  }
});

directorToggle.addEventListener("click", () => {
  document.body.classList.toggle("director-mode");
  const active = document.body.classList.contains("director-mode");
  directorToggle.classList.toggle("is-active", active);
  hudMode.textContent = active ? "DIRECTOR" : "CINEMA";
  playTone(active ? 520 : 220, 0.12, "square", 0.025);
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const cursorDot = document.querySelector(".cursor-dot");
const cursorRing = document.querySelector(".cursor-ring");
let pointerX = window.innerWidth / 2;
let pointerY = window.innerHeight / 2;
let ringX = pointerX;
let ringY = pointerY;

window.addEventListener("pointermove", (event) => {
  pointerX = event.clientX;
  pointerY = event.clientY;
  cursorDot.style.opacity = "1";
  cursorRing.style.opacity = "1";
  cursorDot.style.transform = `translate(${pointerX - 2}px, ${pointerY - 2}px)`;
  document.documentElement.style.setProperty("--mx", `${(pointerX / window.innerWidth) * 100}%`);
  document.documentElement.style.setProperty("--my", `${(pointerY / window.innerHeight) * 100}%`);
}, { passive: true });

function animateCursor() {
  ringX = lerp(ringX, pointerX, 0.18);
  ringY = lerp(ringY, pointerY, 0.18);
  cursorRing.style.transform = `translate(${ringX - 21}px, ${ringY - 21}px)`;
  requestAnimationFrame(animateCursor);
}

animateCursor();

document.querySelectorAll("a, button, input, .magnetic").forEach((element) => {
  element.addEventListener("pointerenter", () => {
    cursorRing.classList.add("is-active");
    playTone(420, 0.035, "triangle", 0.012);
  });
  element.addEventListener("pointerleave", () => {
    cursorRing.classList.remove("is-active");
    element.style.transform = "";
  });
});

document.querySelectorAll(".magnetic").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${clamp(x * 0.12, -9, 9)}px, ${clamp(y * 0.12, -9, 9)}px)`;
  });
});

document.querySelectorAll("[data-tilt]").forEach((element) => {
  element.addEventListener("pointermove", (event) => {
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.transform = `perspective(900px) rotateX(${clamp(y * -8, -8, 8)}deg) rotateY(${clamp(x * 10, -10, 10)}deg)`;
    element.style.setProperty("--tx", `${x * 18}px`);
    element.style.setProperty("--ty", `${y * 18}px`);
    element.style.setProperty("--rx", `${(x + 0.5) * 100}%`);
    element.style.setProperty("--ry", `${(y + 0.5) * 100}%`);
  });
  element.addEventListener("pointerleave", () => {
    element.style.transform = "";
    element.style.setProperty("--tx", "0px");
    element.style.setProperty("--ty", "0px");
  });
});

const canvas = document.querySelector("[data-atmosphere]");
const ctx = canvas.getContext("2d");
let width = 0;
let height = 0;
let dpr = 1;
let particles = [];
let sparks = [];
let fireflies = [];

function createFirefly() {
  const size = 1.1 + Math.random() * 1.9;
  const hue = Math.random();
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0.12 + Math.random() * 0.28,
    vy: (Math.random() - 0.5) * 0.12,
    drift: 0.0012 + Math.random() * 0.0022,
    phase: Math.random() * Math.PI * 2,
    size,
    glow: 10 + size * 7 + Math.random() * 12,
    color: hue > 0.82 ? "57,231,255" : "216,255,63",
    orbit: 26 + Math.random() * 68,
  };
}

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const particleCount = clamp(Math.floor(width / 11), 70, 160);
  particles = Array.from({ length: particleCount }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random(),
    vx: (Math.random() - 0.5) * 0.45,
    vy: (Math.random() - 0.5) * 0.45,
  }));
  sparks = Array.from({ length: 18 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    speed: 1 + Math.random() * 2.4,
    life: Math.random(),
  }));
  const fireflyCount = clamp(Math.floor(width / 145), 7, 13);
  fireflies = Array.from({ length: fireflyCount }, createFirefly);
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function drawAtmosphere(time) {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";

  const mx = pointerX || width * 0.7;
  const my = pointerY || height * 0.42;
  const glow = ctx.createRadialGradient(mx, my, 0, mx, my, Math.max(width, height) * 0.55);
  glow.addColorStop(0, "rgba(216,255,63,0.12)");
  glow.addColorStop(0.28, "rgba(57,231,255,0.06)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  particles.forEach((p, index) => {
    const dx = (mx - width / 2) * 0.0009 * (1 + p.z);
    const dy = (my - height / 2) * 0.0009 * (1 + p.z);
    p.x += p.vx + dx;
    p.y += p.vy + dy;
    if (p.x < -20) p.x = width + 20;
    if (p.x > width + 20) p.x = -20;
    if (p.y < -20) p.y = height + 20;
    if (p.y > height + 20) p.y = -20;

    const size = 1 + p.z * 3;
    ctx.fillStyle = index % 5 === 0 ? "rgba(216,255,63,0.5)" : "rgba(248,244,234,0.28)";
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  sparks.forEach((s) => {
    s.x += s.speed * 2.2;
    s.y -= s.speed * 0.32;
    s.life += 0.012;
    if (s.x > width + 120 || s.life > 1.8) {
      s.x = -120;
      s.y = Math.random() * height;
      s.life = 0;
      s.speed = 1 + Math.random() * 2.4;
    }
    const alpha = Math.max(0, 1 - s.life / 1.8);
    ctx.strokeStyle = `rgba(57,231,255,${alpha * 0.45})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - 90, s.y + 14);
    ctx.stroke();
  });

  fireflies.forEach((bug, index) => {
    const pulse = 0.5 + Math.sin(time * (bug.drift * 2.2) + bug.phase) * 0.5;
    const wanderX = Math.cos(time * bug.drift + bug.phase) * 0.08;
    const wanderY = Math.sin(time * bug.drift * 1.4 + bug.phase) * 0.16;
    const toMouseX = mx - bug.x;
    const toMouseY = my - bug.y;
    const mouseDistance = Math.hypot(toMouseX, toMouseY) || 1;
    const pull = mouseDistance < 210 ? (1 - mouseDistance / 210) * 0.006 : 0;

    bug.vx += wanderX * 0.01 + (toMouseX / mouseDistance) * pull;
    bug.vy += wanderY * 0.01 + (toMouseY / mouseDistance) * pull;
    bug.vx = clamp(bug.vx * 0.996, 0.08, 0.48);
    bug.vy = clamp(bug.vy * 0.996, -0.22, 0.22);
    bug.x += bug.vx + Math.cos(time * bug.drift + index) * 0.08;
    bug.y += bug.vy + Math.sin(time * bug.drift * 1.2 + index) * 0.08;

    if (bug.x < -bug.glow) bug.x = width + bug.glow;
    if (bug.x > width + bug.glow) bug.x = -bug.glow;
    if (bug.y < -bug.glow) bug.y = height + bug.glow;
    if (bug.y > height + bug.glow) bug.y = -bug.glow;

    const alpha = 0.05 + pulse * 0.22;
    const halo = ctx.createRadialGradient(bug.x, bug.y, 0, bug.x, bug.y, bug.glow);
    halo.addColorStop(0, `rgba(${bug.color},${alpha})`);
    halo.addColorStop(0.24, `rgba(${bug.color},${alpha * 0.28})`);
    halo.addColorStop(1, `rgba(${bug.color},0)`);
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(bug.x, bug.y, bug.glow, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `rgba(255,255,220,${0.22 + pulse * 0.34})`;
    ctx.beginPath();
    ctx.arc(bug.x, bug.y, bug.size * (0.65 + pulse * 0.35), 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.globalCompositeOperation = "source-over";
  const waveY = height * 0.58 + Math.sin(time * 0.0008) * 24;
  ctx.strokeStyle = "rgba(216,255,63,0.22)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= width; x += 18) {
    const y = waveY + Math.sin(x * 0.01 + time * 0.002) * 22;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  requestAnimationFrame(drawAtmosphere);
}

requestAnimationFrame(drawAtmosphere);

const reactorData = {
  site: {
    code: "01",
    title: "Sites que parecem cenas, n&atilde;o p&aacute;ginas.",
    text: "Hero cinematogr&aacute;fico, narrativa por scroll, microintera&ccedil;&otilde;es e convers&atilde;o sem matar a aura da marca.",
    tags: ["Interface", "Dire&ccedil;&atilde;o", "Performance"],
  },
  brand: {
    code: "02",
    title: "Identidades que grudam no sistema nervoso.",
    text: "Logo, linguagem, contraste, composi&ccedil;&atilde;o e aplica&ccedil;&otilde;es para a marca ficar reconhec&iacute;vel em um frame.",
    tags: ["S&iacute;mbolo", "Sistema visual", "Manual"],
  },
  motion: {
    code: "03",
    title: "Movimento com fun&ccedil;&atilde;o, n&atilde;o firula.",
    text: "Anima&ccedil;&otilde;es, transi&ccedil;&otilde;es, estados e intera&ccedil;&otilde;es que guiam a aten&ccedil;&atilde;o sem cansar o visitante.",
    tags: ["Scroll", "Microintera&ccedil;&atilde;o", "Canvas"],
  },
  launch: {
    code: "04",
    title: "Lan&ccedil;amento digital com cara de evento.",
    text: "Da primeira dobra ao WhatsApp, a experi&ecirc;ncia inteira &eacute; pensada para gerar impacto e levar &agrave; a&ccedil;&atilde;o.",
    tags: ["Narrativa", "CTA", "Convers&atilde;o"],
  },
};

const reactorStage = document.querySelector("[data-reactor-stage]");
const reactorTabs = document.querySelectorAll("[data-service]");

function setReactor(key) {
  const data = reactorData[key];
  reactorTabs.forEach((tab) => tab.classList.toggle("active", tab.dataset.service === key));
  reactorStage.animate([
    { opacity: 0.35, transform: "translateY(16px) scale(0.98)" },
    { opacity: 1, transform: "translateY(0) scale(1)" },
  ], { duration: 320, easing: "ease-out" });
  reactorStage.innerHTML = `
    <p class="stage-code">${data.code}</p>
    <h3>${data.title}</h3>
    <p>${data.text}</p>
    <div class="tag-row">${data.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
  `;
}

reactorTabs.forEach((tab) => {
  tab.addEventListener("click", () => setReactor(tab.dataset.service));
});

const orbit = document.querySelector("[data-project-orbit]");
let orbitDragging = false;
let orbitStartX = 0;
let orbitScrollX = 0;
let orbitDragDistance = 0;
let suppressProjectClick = false;

orbit.addEventListener("pointerdown", (event) => {
  if (orbit.classList.contains("case-wall")) return;
  orbitDragging = true;
  orbitDragDistance = 0;
  orbitStartX = event.clientX;
  orbitScrollX = orbit.scrollLeft;
  orbit.classList.add("is-dragging");
  orbit.setPointerCapture(event.pointerId);
});

orbit.addEventListener("pointermove", (event) => {
  if (orbit.classList.contains("case-wall")) return;
  if (!orbitDragging) return;
  orbitDragDistance = Math.max(orbitDragDistance, Math.abs(event.clientX - orbitStartX));
  orbit.scrollLeft = orbitScrollX - (event.clientX - orbitStartX);
});

orbit.addEventListener("pointerup", () => {
  orbitDragging = false;
  suppressProjectClick = orbitDragDistance > 8;
  window.setTimeout(() => { suppressProjectClick = false; }, 0);
  orbit.classList.remove("is-dragging");
});

orbit.addEventListener("pointerleave", () => {
  orbitDragging = false;
  orbit.classList.remove("is-dragging");
});

const dialog = document.querySelector("[data-project-dialog]");
const dialogTitle = document.querySelector("[data-dialog-title]");
const dialogType = document.querySelector("[data-dialog-type]");
const dialogNote = document.querySelector("[data-dialog-note]");
const dialogLink = document.querySelector("[data-dialog-link]");
const dialogImage = document.querySelector("[data-dialog-image]");
const closeDialog = document.querySelector("[data-dialog-close]");
const casePrev = document.querySelector("[data-case-prev]");
const caseNext = document.querySelector("[data-case-next]");
const projectCards = [...document.querySelectorAll(".project-card")];
let activeProjectIndex = 0;

function openProject(index) {
  const card = projectCards[index];
  if (!card) return;
  activeProjectIndex = index;
  dialogTitle.textContent = card.dataset.title;
  dialogType.textContent = card.dataset.type;
  dialogNote.textContent = card.dataset.note;
  dialogLink.href = card.dataset.link;
  const image = card.querySelector("img");
  dialogImage.src = image.src;
  dialogImage.alt = image.alt;
  if (typeof dialog.showModal === "function" && !dialog.open) dialog.showModal();
  playTone(160, 0.08, "sawtooth", 0.02);
}

projectCards.forEach((card, index) => {
  card.addEventListener("click", (event) => {
    if (event.target.closest("a")) return;
    if (suppressProjectClick) return;
    openProject(index);
  });
});

closeDialog.addEventListener("click", () => {
  dialog.close();
  playTone(120, 0.06, "triangle", 0.02);
});
dialog.addEventListener("click", (event) => {
  const rect = dialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
    dialog.close();
  }
});

casePrev.addEventListener("click", () => {
  openProject((activeProjectIndex - 1 + projectCards.length) % projectCards.length);
});

caseNext.addEventListener("click", () => {
  openProject((activeProjectIndex + 1) % projectCards.length);
});

document.querySelectorAll(".ritual-card").forEach((card) => {
  card.addEventListener("click", () => {
    document.querySelectorAll(".ritual-card").forEach((item) => item.classList.remove("active"));
    card.classList.add("active");
  });
});

const briefForm = document.querySelector("[data-brief-form]");
const briefLine = document.querySelector("[data-brief-line]");
const whatsappLink = document.querySelector("[data-whatsapp-link]");
const aiForm = document.querySelector("[data-ai-form]");
const aiResult = document.querySelector("[data-ai-result]");
const aiSubmit = document.querySelector("[data-ai-submit]");
const labResult = document.querySelector("[data-lab-result]");
const moodImage = document.querySelector("[data-mood-image]");
const logoFile = document.querySelector("[data-logo-file]");
const logoAnalyze = document.querySelector("[data-logo-analyze]");
const chatForm = document.querySelector("[data-chat-form]");

const intensityMap = {
  1: "intensidade elegante",
  2: "intensidade marcante",
  3: "intensidade máxima",
};

const speedMap = {
  1: "ritmo calmo",
  2: "ritmo equilibrado",
  3: "ritmo acelerado",
};

function updateBrief() {
  const data = new FormData(briefForm);
  const kind = data.get("kind");
  const intensity = intensityMap[data.get("intensity")];
  const speed = speedMap[data.get("speed")];
  const readable = `${kind} com ${intensity} e ${speed}.`;
  briefLine.textContent = readable;
  whatsappLink.href = `https://wa.me/5561996067198?text=${encodeURIComponent(`Oi, quero iniciar um projeto: ${readable}`)}`;
}

briefForm.addEventListener("input", updateBrief);
updateBrief();

function localAiFallback(input) {
  const business = input.business || "marca";
  const goal = input.goal || "ganhar presenca digital";
  const vibe = input.vibe || "cinematografica, premium e tecnologica";
  return {
    mode: "local",
    diagnosis: `A ${business} precisa sair da zona de site institucional comum. Para ${goal}, a marca deve construir uma presenca que seja lembrada no primeiro contato e conduza o visitante para uma acao clara.`,
    visualDirection: `A direcao recomendada e ${vibe}: contraste alto, narrativa por cenas, elementos de interface viva, movimento controlado e uma abertura que pareca uma transmissao de marca.`,
    siteStructure: [
      "Cena de abertura com manifesto forte",
      "Diagnostico interativo por IA",
      "Arquivo visual com cases em tela cheia",
      "Launchpad para qualificar o projeto",
      "Contato final com transmissao para WhatsApp",
    ],
    whatsappMessage: `Oi, quero iniciar um projeto com a Gaijin. Marca/segmento: ${business}. Objetivo: ${goal}. Vibe desejada: ${vibe}. Observacoes: ${input.notes || "quero uma experiencia tecnologica e cinematografica"}.`,
  };
}

function renderAiResult(result) {
  const structure = Array.isArray(result.siteStructure) ? result.siteStructure : [];
  aiResult.classList.remove("is-loading");
  aiResult.innerHTML = `
    <p class="eyebrow">${result.mode === "huggingface" ? "Hugging Face / Diagnóstico gerado" : "Diagnóstico local / fallback"}</p>
    <h4>${result.diagnosis || "Diagnóstico gerado."}</h4>
    <p>${result.visualDirection || ""}</p>
    ${structure.length ? `<ul>${structure.map((item) => `<li>${item}</li>`).join("")}</ul>` : ""}
  `;

  if (result.whatsappMessage) {
    whatsappLink.href = `https://wa.me/5561996067198?text=${encodeURIComponent(result.whatsappMessage)}`;
    briefLine.textContent = result.whatsappMessage;
  }
}

function getAiContext(extra = {}) {
  const aiData = Object.fromEntries(new FormData(aiForm).entries());
  const briefData = Object.fromEntries(new FormData(briefForm).entries());
  return {
    business: aiData.business || "",
    goal: aiData.goal || `${briefData.kind || "Projeto"} com intensidade ${briefData.intensity || "3"}`,
    vibe: aiData.vibe || "cinematografica, tecnologica e memoravel",
    notes: aiData.notes || briefLine.textContent || "",
    ...extra,
  };
}

function list(items = []) {
  return Array.isArray(items) && items.length ? `<ul>${items.map((item) => `<li>${item}</li>`).join("")}</ul>` : "";
}

function renderLabResult(result) {
  labResult.classList.remove("is-loading");
  const title = result.title || "Resultado gerado";

  if (result.score) {
    labResult.innerHTML = `
      <p class="eyebrow">${result.mode === "huggingface" ? "Hugging Face" : "Fallback"} / Score</p>
      <h4>${title}</h4>
      <div class="score-grid">
        <div><span>Impacto</span><strong>${result.score.impact}%</strong></div>
        <div><span>Clareza</span><strong>${result.score.clarity}%</strong></div>
        <div><span>Premium</span><strong>${result.score.premium}%</strong></div>
        <div><span>Urgência</span><strong>${result.score.urgency}</strong></div>
      </div>
      <p>${result.summary || ""}</p>
      ${list(result.actions)}
    `;
    return;
  }

  if (result.palette) {
    labResult.innerHTML = `
      <p class="eyebrow">${result.mode === "huggingface" ? "Hugging Face" : "Fallback"} / Moodboard</p>
      <h4>${title}</h4>
      <div class="palette-row">${result.palette.map((color) => `<span style="background:${color}">${color}</span>`).join("")}</div>
      <p>${result.visualLanguage || ""}</p>
      ${list(result.motion)}
      ${list(result.prompts)}
    `;
    if (result.prompts?.[0]) generateMoodImage(result.prompts[0]);
    return;
  }

  if (result.phases || result.deliverables) {
    labResult.innerHTML = `
      <p class="eyebrow">${result.mode === "huggingface" ? "Hugging Face" : "Fallback"} / Proposta</p>
      <h4>${title}</h4>
      <p>${result.summary || ""}</p>
      <p><strong>Fases</strong></p>
      ${list(result.phases)}
      <p><strong>Entregáveis</strong></p>
      ${list(result.deliverables)}
      <p>${result.estimate || ""}</p>
    `;
    return;
  }

  if (result.headline) {
    labResult.innerHTML = `
      <p class="eyebrow">${result.mode === "huggingface" ? "Hugging Face" : "Fallback"} / Personalização</p>
      <h4>${result.headline}</h4>
      <p>${result.subhead || ""}</p>
      ${list(result.sections)}
      <p><strong>CTA:</strong> ${result.cta || ""}</p>
    `;
    return;
  }

  if (result.strengths || result.recommendations) {
    const logoSource = result.mode === "huggingface" ? "Hugging Face" : result.mode === "local-analysis" ? "Analisador visual" : "Fallback";
    labResult.innerHTML = `
      <p class="eyebrow">${logoSource} / Logo</p>
      <h4>${title}</h4>
      <p>${result.caption || ""}</p>
      ${result.warning ? `<p><strong>Status tecnico:</strong> ${result.warning}</p>` : ""}
      <p><strong>Forças</strong></p>
      ${list(result.strengths)}
      <p><strong>Riscos</strong></p>
      ${list(result.risks)}
      <p><strong>Recomendações</strong></p>
      ${list(result.recommendations)}
    `;
    return;
  }

  labResult.innerHTML = `
    <p class="eyebrow">${result.mode === "huggingface" ? "Hugging Face" : "Fallback"} / Concierge</p>
    <h4>${title}</h4>
    <p>${result.answer || ""}</p>
    <p>${result.nextQuestion || ""}</p>
  `;
}

async function runSuiteTask(task, extra = {}) {
  labResult.classList.add("is-loading");
  moodImage.hidden = true;
  labResult.innerHTML = `
    <p class="eyebrow">AI Lab / Processando</p>
    <h4>Consultando módulo: ${task}</h4>
  `;

  const response = await fetch("/api/ai-suite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ task, ...getAiContext(extra) }),
  });
  if (!response.ok) throw new Error("Falha no AI Lab.");
  renderLabResult(await response.json());
}

async function generateMoodImage(prompt) {
  try {
    const response = await fetch("/api/moodboard-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const payload = await response.json();
    if (payload.image) {
      const image = moodImage.querySelector("img");
      image.src = payload.image;
      moodImage.querySelector("figcaption").textContent = payload.prompt;
      moodImage.hidden = false;
    }
  } catch {
    moodImage.hidden = true;
  }
}

document.querySelectorAll("[data-suite-task]").forEach((button) => {
  button.addEventListener("click", async () => {
    try {
      await runSuiteTask(button.dataset.suiteTask);
      playTone(520, 0.1, "triangle", 0.025);
    } catch {
      renderLabResult({ mode: "local", title: "Módulo indisponível", answer: "Não consegui acessar o AI Lab agora. Rode pelo server.mjs para ativar os endpoints." });
    }
  });
});

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function analyzeLogoLocally(imageData) {
  return new Promise((resolve, reject) => {
    if (!imageData) {
      resolve(null);
      return;
    }

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSize = 420;
      const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

      const context = canvas.getContext("2d");
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const colors = new Map();
      let visible = 0;
      let transparent = 0;
      let dark = 0;
      let light = 0;
      let colorfulness = 0;
      let contrast = 0;
      let totalBrightness = 0;
      const step = Math.max(4, Math.floor(pixels.length / 16000) * 4);

      for (let index = 0; index < pixels.length; index += step) {
        const r = pixels[index];
        const g = pixels[index + 1];
        const b = pixels[index + 2];
        const a = pixels[index + 3];
        if (a < 28) {
          transparent += 1;
          continue;
        }

        visible += 1;
        const brightness = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        totalBrightness += brightness;
        if (brightness < 0.28) dark += 1;
        if (brightness > 0.74) light += 1;
        colorfulness += (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
        contrast += Math.abs(brightness - 0.5) * 2;

        const key = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`;
        colors.set(key, (colors.get(key) || 0) + 1);
      }

      const sampleCount = visible + transparent || 1;
      const dominantColors = [...colors.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([color]) => `rgb(${color})`);

      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
        aspectRatio: Number((image.naturalWidth / Math.max(1, image.naturalHeight)).toFixed(2)),
        transparentRatio: Number((transparent / sampleCount).toFixed(2)),
        darkRatio: Number((dark / Math.max(1, visible)).toFixed(2)),
        lightRatio: Number((light / Math.max(1, visible)).toFixed(2)),
        averageBrightness: Number((totalBrightness / Math.max(1, visible)).toFixed(2)),
        colorfulness: Number((colorfulness / Math.max(1, visible)).toFixed(2)),
        contrast: Number((contrast / Math.max(1, visible)).toFixed(2)),
        dominantColors,
      });
    };
    image.onerror = reject;
    image.src = imageData;
  });
}

logoAnalyze.addEventListener("click", async () => {
  const file = logoFile.files?.[0];
  labResult.classList.add("is-loading");
  labResult.innerHTML = `
    <p class="eyebrow">AI Lab / Logo</p>
    <h4>Analisando imagem enviada...</h4>
  `;

  try {
    const imageData = file ? await readFileAsDataUrl(file) : "";
    const imageStats = await analyzeLogoLocally(imageData);
    const response = await fetch("/api/logo-analysis", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...getAiContext(), imageData, imageStats, fileName: file?.name || "" }),
    });
    if (!response.ok) throw new Error(`API retornou ${response.status}.`);
    renderLabResult(await response.json());
  } catch {
    renderLabResult({
      mode: "local",
      title: "Analisador indisponivel",
      caption: "A rota /api/logo-analysis nao respondeu. Na Vercel, publique a pasta api, confirme HF_TOKEN em Production/Preview e faca Redeploy.",
      strengths: ["Interface preparada", "Upload funcionando no navegador"],
      risks: ["Endpoint de IA ainda nao publicado ou deploy antigo sem as funcoes"],
      recommendations: ["Enviar os arquivos da pasta api para o GitHub/Vercel", "Fazer Redeploy depois de salvar HF_TOKEN", "Testar a URL /api/logo-analysis no deploy"],
    });
    return;
    renderLabResult({ mode: "local", title: "Análise local de logo", caption: "Envie um arquivo de imagem e rode pelo servidor local para ativar a análise.", strengths: ["Fluxo preparado"], risks: ["Imagem não processada"], recommendations: ["Rodar via server.mjs"] });
  }
});

chatForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const question = new FormData(chatForm).get("question");
  if (!question) return;
  try {
    await runSuiteTask("chat", { question });
  } catch {
    renderLabResult({ mode: "local", title: "Concierge local", answer: "Eu recomendaria começar pelo diagnóstico, depois gerar uma proposta e usar o score para priorizar o impacto visual.", nextQuestion: "Qual é o segmento da marca?" });
  }
});

aiForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = Object.fromEntries(new FormData(aiForm).entries());
  aiSubmit.disabled = true;
  aiSubmit.textContent = "Analisando...";
  aiResult.classList.add("is-loading");
  aiResult.innerHTML = `
    <p class="eyebrow">IA / Processando sinal</p>
    <h4>Decodificando marca, objetivo e atmosfera...</h4>
    <p>Se o Hugging Face n&atilde;o estiver configurado, o sistema usa um diagn&oacute;stico local.</p>
  `;

  try {
    const response = await fetch("/api/ai-brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error("API indisponível.");
    renderAiResult(await response.json());
    playTone(620, 0.12, "triangle", 0.035);
  } catch {
    renderAiResult(localAiFallback(input));
    playTone(260, 0.1, "sawtooth", 0.025);
  } finally {
    aiSubmit.disabled = false;
    aiSubmit.textContent = "Gerar diagnóstico";
  }
});

launchButton.addEventListener("click", () => {
  const link = whatsappLink.href;
  launchOverlay.classList.add("is-active");
  launchOverlay.setAttribute("aria-hidden", "false");
  let count = 3;
  launchCount.textContent = `0${count}`;
  playTone(180, 0.12, "sawtooth", 0.03);
  const timer = window.setInterval(() => {
    count -= 1;
    launchCount.textContent = count > 0 ? `0${count}` : "GO";
    playTone(count > 0 ? 220 + count * 90 : 620, 0.12, count > 0 ? "sawtooth" : "square", 0.03);
    if (count < 0) {
      window.clearInterval(timer);
      launchOverlay.classList.remove("is-active");
      launchOverlay.setAttribute("aria-hidden", "true");
      window.open(link, "_blank", "noreferrer");
    }
  }, 720);
});
