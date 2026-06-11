document.body.classList.add("has-js");

const form = document.querySelector("[data-briefing-form]");
const colorList = document.querySelector("[data-color-list]");
const addColorButton = document.querySelector("[data-add-color]");
const referenceInput = document.querySelector("[data-reference-input]");
const referencePreview = document.querySelector("[data-reference-preview]");
const generateButton = document.querySelector("[data-generate-briefing]");
const whatsappButton = document.querySelector("[data-whatsapp-briefing]");
const statusText = document.querySelector("[data-briefing-status]");
const progressText = document.querySelector("[data-briefing-progress]");
const canvas = document.querySelector("[data-briefing-atmosphere]");
const ctx = canvas.getContext("2d");

const preview = {
  brand: document.querySelector("[data-preview-brand]"),
  tagline: document.querySelector("[data-preview-tagline]"),
  idea: document.querySelector("[data-preview-idea]"),
  area: document.querySelector("[data-preview-area]"),
  audience: document.querySelector("[data-preview-audience]"),
  personality: document.querySelector("[data-preview-personality]"),
  usage: document.querySelector("[data-preview-usage]"),
  palette: document.querySelector("[data-preview-palette]"),
  references: document.querySelector("[data-preview-references]"),
  technical: document.querySelector("[data-preview-technical]"),
  document: document.querySelector("[data-briefing-preview]"),
};

let references = [];
let width = 0;
let height = 0;
let dpr = 1;
let particles = [];

function resizeCanvas() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: Math.min(42, Math.max(18, Math.floor(width / 44))) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: 0.08 + Math.random() * 0.22,
    vy: (Math.random() - 0.5) * 0.12,
    r: 1 + Math.random() * 2.4,
    phase: Math.random() * Math.PI * 2,
  }));
}

function drawAtmosphere(time = 0) {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "lighter";
  particles.forEach((particle, index) => {
    particle.x += particle.vx;
    particle.y += particle.vy + Math.sin(time * 0.001 + particle.phase) * 0.03;
    if (particle.x > width + 20) particle.x = -20;
    if (particle.y < -20) particle.y = height + 20;
    if (particle.y > height + 20) particle.y = -20;
    const pulse = 0.35 + Math.sin(time * 0.002 + index) * 0.25;
    const glow = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, 24);
    glow.addColorStop(0, `rgba(216,255,63,${0.16 + pulse})`);
    glow.addColorStop(1, "rgba(216,255,63,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,225,0.52)";
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(drawAtmosphere);
}

function createColorRow(value = "#d8ff3f", name = "") {
  const row = document.createElement("div");
  row.className = "color-chip-row";
  row.innerHTML = `
    <input type="color" value="${value}" aria-label="Selecionar cor">
    <input type="text" value="${name || value}" placeholder="Nome ou uso da cor">
    <button class="remove-color" type="button" aria-label="Remover cor">&times;</button>
  `;
  row.querySelector("input[type='color']").addEventListener("input", (event) => {
    const label = row.querySelector("input[type='text']");
    label.value = event.target.value.toUpperCase();
    updatePreview();
  });
  row.querySelector("input[type='text']").addEventListener("input", updatePreview);
  row.querySelector(".remove-color").addEventListener("click", () => {
    if (colorList.children.length > 1) row.remove();
    updatePreview();
  });
  colorList.appendChild(row);
  updatePreview();
}

function getColors() {
  return [...colorList.querySelectorAll(".color-chip-row")].map((row) => ({
    value: row.querySelector("input[type='color']").value,
    label: row.querySelector("input[type='text']").value || row.querySelector("input[type='color']").value,
  }));
}

function getFormData() {
  return Object.fromEntries(new FormData(form).entries());
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleReferences() {
  const files = [...referenceInput.files].slice(0, 3);
  references = await Promise.all(files.map(fileToDataUrl));
  renderReferences();
  updatePreview();
}

function renderReferences() {
  const slots = [0, 1, 2].map((index) => {
    const image = references[index];
    return image ? `<div><img src="${image}" alt="Referencia ${index + 1}"></div>` : `<div>REF 0${index + 1}</div>`;
  }).join("");
  referencePreview.innerHTML = slots;
  preview.references.innerHTML = slots;
}

function buildTechnicalList(data) {
  const colors = getColors().map(color => color.label).join(", ") || "paleta a definir";
  return [
    `Criar logo para ${data.brandName || "marca"} com linguagem ${data.personality || "minimalista e premium"}.`,
    `Priorizar aplicacao em ${data.usage || "site, redes sociais e materiais digitais"}.`,
    `Explorar paleta desejada: ${colors}.`,
    `Evitar: ${data.avoid || "excesso visual, baixa legibilidade e simbolos genericos"}.`,
    "Entregar versoes horizontal, vertical, reduzida, monocromatica, positiva e negativa.",
    "Testar leitura em favicon, avatar de rede social, mobile, fundo escuro e fundo claro.",
    "Preparar arquivos finais em SVG, PDF vetorial, PNG transparente e pacote social.",
    "Validar contraste WCAG em aplicacoes digitais e legibilidade em 16px, 32px e 128px.",
  ];
}

function hexToRgb(hex) {
  const clean = String(hex).replace("#", "");
  const value = clean.length === 3 ? clean.split("").map((item) => item + item).join("") : clean;
  return [
    parseInt(value.slice(0, 2), 16) || 0,
    parseInt(value.slice(2, 4), 16) || 0,
    parseInt(value.slice(4, 6), 16) || 0,
  ];
}

function luminance(hex) {
  const [r, g, b] = hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(colorA, colorB) {
  const lighter = Math.max(luminance(colorA), luminance(colorB));
  const darker = Math.min(luminance(colorA), luminance(colorB));
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

function sanitizeFileName(value) {
  return String(value || "briefing-logo")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function pdfText(pdf, text, x, y, options = {}) {
  const {
    size = 11,
    color = [248, 244, 234],
    style = "normal",
    maxWidth = 170,
    lineHeight = size * 0.42,
  } = options;
  pdf.setFont("helvetica", style);
  pdf.setFontSize(size);
  pdf.setTextColor(...color);
  const lines = pdf.splitTextToSize(String(text || "-"), maxWidth);
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
}

function pdfLabel(pdf, text, x, y) {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7);
  pdf.setTextColor(216, 255, 63);
  pdf.text(String(text).toUpperCase(), x, y);
}

function addPdfBackground(pdf, pageNumber) {
  pdf.setFillColor(5, 5, 5);
  pdf.rect(0, 0, 210, 297, "F");
  pdf.setFillColor(14, 24, 24);
  pdf.rect(0, 0, 210, 297, "F");
  pdf.setFillColor(216, 255, 63);
  pdf.rect(12, 18, 42, 1.2, "F");
  pdf.setFillColor(57, 231, 255);
  pdf.rect(156, 278, 42, 1.2, "F");
  pdf.setDrawColor(42, 52, 48);
  pdf.setLineWidth(0.2);
  pdf.rect(10, 12, 190, 270);
  pdf.setTextColor(90, 100, 96);
  pdf.setFontSize(7);
  pdf.text(`GAIJIN CREATIVE / LOGO BRIEFING / ${String(pageNumber).padStart(2, "0")}`, 14, 287);
}

function addSectionTitle(pdf, eyebrow, title, y) {
  pdfLabel(pdf, eyebrow, 18, y);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(24);
  pdf.setTextColor(248, 244, 234);
  pdf.text(pdf.splitTextToSize(title, 176), 18, y + 12);
  return y + 30;
}

function addMetricBox(pdf, label, value, x, y, w = 82, h = 26) {
  pdf.setDrawColor(58, 68, 64);
  pdf.setFillColor(12, 16, 15);
  pdf.rect(x, y, w, h, "FD");
  pdfLabel(pdf, label, x + 4, y + 8);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.setTextColor(248, 244, 234);
  pdf.text(pdf.splitTextToSize(String(value || "-"), w - 8), x + 4, y + 17);
}

function addColorSpec(pdf, color, x, y) {
  const [r, g, b] = hexToRgb(color.value);
  const hex = color.value.toUpperCase();
  const label = color.label?.startsWith("#") ? hex : color.label || hex;
  const blackContrast = contrastRatio(color.value, "#050505");
  const whiteContrast = contrastRatio(color.value, "#ffffff");

  pdf.setDrawColor(70, 76, 72);
  pdf.setFillColor(10, 14, 13);
  pdf.rect(x, y, 174, 34, "FD");
  pdf.setFillColor(r, g, b);
  pdf.rect(x, y, 34, 34, "F");
  pdf.setDrawColor(70, 76, 72);
  pdf.rect(x, y, 34, 34);
  pdfLabel(pdf, label, x + 42, y + 8);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.6);
  pdf.setTextColor(210, 216, 204);
  pdf.text(`${hex} / RGB ${r}, ${g}, ${b}`, x + 42, y + 17);
  pdf.setTextColor(160, 170, 164);
  pdf.text(`Contraste: fundo escuro ${blackContrast}:1 / fundo claro ${whiteContrast}:1`, x + 42, y + 26);
}

function getBriefingPayload() {
  const data = getFormData();
  const colors = getColors();
  const technical = buildTechnicalList(data);
  const strategic = [
    `A marca ${data.brandName || "sem nome definido"} precisa ser percebida como ${data.personality || "minimalista e premium"}.`,
    `O simbolo deve comunicar: ${data.logoIdea || "conceito a aprofundar na imersao"}.`,
    `A decisao visual precisa funcionar para ${data.audience || "publico ainda a definir"} e manter leitura em ${data.usage || "aplicacoes digitais e comerciais"}.`,
  ];
  const deliverables = [
    "Logo principal e versoes secundarias",
    "Simbolo isolado e assinatura horizontal",
    "Arquivos vetoriais SVG/PDF",
    "PNG transparente em alta resolucao",
    "Versoes positiva, negativa e monocromatica",
    "Mini guia de uso com area de respiro, reducao minima e paleta",
  ];
  return { data, colors, technical, strategic, deliverables };
}

function updatePreview() {
  const data = getFormData();
  const colors = getColors();
  const filled = ["brandName", "businessArea", "audience", "logoIdea", "usage"].filter((key) => data[key]?.trim()).length;
  const progress = Math.round(((filled + Math.min(colors.length, 4) + references.length) / 12) * 100);

  preview.brand.textContent = data.brandName || "Marca sem nome";
  preview.tagline.textContent = `${data.personality || "Direcao visual"} / ${data.deadline || "prazo a definir"}`;
  preview.idea.textContent = data.logoIdea || "Preencha os campos para gerar uma leitura clara da ideia do logo.";
  preview.area.textContent = data.businessArea || "-";
  preview.audience.textContent = data.audience || "-";
  preview.personality.textContent = data.personality || "-";
  preview.usage.textContent = data.usage || "-";
  preview.palette.innerHTML = colors.map((color) => `<span style="background:${color.value}">${color.label}</span>`).join("");
  preview.technical.innerHTML = buildTechnicalList(data).map((item) => `<li>${item}</li>`).join("");
  statusText.textContent = progress >= 70 ? "BRIEFING FORTE" : progress >= 35 ? "SINAL FORMANDO" : "AGUARDANDO INPUT";
  progressText.textContent = `${Math.min(100, progress)}% decodificado`;

  const message = [
    "Oi, quero enviar um briefing de logo para a Gaijin.",
    "",
    `Marca: ${data.brandName || "-"}`,
    `Segmento: ${data.businessArea || "-"}`,
    `Ideia: ${data.logoIdea || "-"}`,
    `Cores: ${colors.map((color) => color.label).join(", ") || "-"}`,
    `Referencias: ${references.length} arquivo(s).`,
    "",
    "Vou anexar o PDF do briefing.",
  ].join("\n");
  whatsappButton.href = `https://wa.me/5561996067198?text=${encodeURIComponent(message)}`;
}

async function generatePdf() {
  updatePreview();
  generateButton.disabled = true;
  generateButton.textContent = "Gerando PDF...";

  try {
    if (!window.jspdf?.jsPDF) {
      window.print();
      return;
    }

    const pdf = new window.jspdf.jsPDF("p", "mm", "a4");
    const { data, colors, technical, strategic, deliverables } = getBriefingPayload();
    let pageNumber = 1;

    addPdfBackground(pdf, pageNumber);
    pdfLabel(pdf, "Gaijin Creative / Logo Briefing", 18, 32);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(42);
    pdf.setTextColor(248, 244, 234);
    pdf.text(pdf.splitTextToSize(data.brandName || "Marca sem nome", 174), 18, 58);
    pdf.setFontSize(12);
    pdf.setTextColor(170, 174, 166);
    pdf.text(pdf.splitTextToSize("Documento tecnico-criativo para transformar uma ideia de logo em sistema visual memoravel.", 170), 18, 104);
    addMetricBox(pdf, "Segmento", data.businessArea || "-", 18, 132);
    addMetricBox(pdf, "Publico", data.audience || "-", 110, 132);
    addMetricBox(pdf, "Personalidade", data.personality || "-", 18, 166);
    addMetricBox(pdf, "Prazo", data.deadline || "A definir", 110, 166);
    pdf.setFillColor(216, 255, 63);
    pdf.rect(18, 218, 70, 10, "F");
    pdf.setTextColor(5, 5, 5);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.text("BRIEFING GERADO PELO CLIENTE", 22, 225);

    pdf.addPage();
    pageNumber += 1;
    addPdfBackground(pdf, pageNumber);
    let y = addSectionTitle(pdf, "01 / Sintese estrategica", "O que este logo precisa resolver", 28);
    y = pdfText(pdf, data.logoIdea || "Ideia central ainda nao informada.", 18, y + 4, { size: 13, maxWidth: 174, color: [220, 224, 216], lineHeight: 6 });
    y += 10;
    pdfLabel(pdf, "Leitura Gaijin", 18, y);
    y += 10;
    strategic.forEach((item) => {
      y = pdfText(pdf, `- ${item}`, 22, y, { size: 10.5, maxWidth: 164, color: [180, 186, 176], lineHeight: 5.2 });
      y += 3;
    });
    y += 8;
    pdfLabel(pdf, "Nao negociar", 18, y);
    y = pdfText(pdf, data.avoid || "Evitar excesso visual, baixa legibilidade e solucoes genericas.", 18, y + 10, { size: 11, maxWidth: 174, color: [248, 244, 234], lineHeight: 5.2 });
    y += 10;
    pdfLabel(pdf, "Observacoes", 18, y);
    pdfText(pdf, data.notes || "Sem observacoes adicionais.", 18, y + 10, { size: 10.5, maxWidth: 174, color: [170, 174, 166], lineHeight: 5.2 });

    pdf.addPage();
    pageNumber += 1;
    addPdfBackground(pdf, pageNumber);
    y = addSectionTitle(pdf, "02 / Sistema cromatico", "Paleta desejada e leitura tecnica", 28);
    let colorY = y;
    colors.forEach((color, index) => {
      if (index > 0 && index % 6 === 0) {
        pdf.addPage();
        pageNumber += 1;
        addPdfBackground(pdf, pageNumber);
        colorY = addSectionTitle(pdf, "02 / Sistema cromatico", "Continuidade da paleta", 28);
      }
      const localIndex = index % 6;
      addColorSpec(pdf, color, 18, colorY + localIndex * 39);
    });
    y = colorY + Math.max(colors.length % 6 || Math.min(colors.length, 6), 1) * 39 + 10;
    if (y > 220) {
      pdf.addPage();
      pageNumber += 1;
      addPdfBackground(pdf, pageNumber);
      y = addSectionTitle(pdf, "02 / Sistema cromatico", "Diretrizes de uso da paleta", 28);
    }
    pdfLabel(pdf, "Diretrizes de cor", 18, y);
    [
      "Definir cor primaria, cor secundaria e cor de alerta/acao.",
      "Validar contraste em fundos escuros, claros e com textura.",
      "Criar versao monocromatica para casos de baixo custo, carimbo, bordado e documentos.",
      "Mapear uso das cores em botao, hover, destaque, fundo, grafismos e motion.",
    ].forEach((item) => {
      y = pdfText(pdf, `- ${item}`, 22, y + 9, { size: 10, maxWidth: 164, color: [180, 186, 176], lineHeight: 5 });
    });

    pdf.addPage();
    pageNumber += 1;
    addPdfBackground(pdf, pageNumber);
    y = addSectionTitle(pdf, "03 / Engenharia visual", "Dados tecnicos para uma marca que escala", 28);
    technical.concat(deliverables.map((item) => `Entrega prevista: ${item}.`)).forEach((item, index) => {
      const x = index % 2 === 0 ? 18 : 108;
      const boxY = y + Math.floor(index / 2) * 34;
      pdf.setDrawColor(54, 62, 58);
      pdf.setFillColor(10, 14, 13);
      pdf.rect(x, boxY, 82, 26, "FD");
      pdfText(pdf, item, x + 4, boxY + 8, { size: 8.4, maxWidth: 74, color: [210, 216, 204], lineHeight: 3.8 });
    });

    if (references.length) {
      pdf.addPage();
      pageNumber += 1;
      addPdfBackground(pdf, pageNumber);
      y = addSectionTitle(pdf, "04 / Referencias", "Modelos enviados pelo cliente", 28);
      references.forEach((image, index) => {
        const x = 18 + index * 60;
        pdf.setDrawColor(58, 68, 64);
        pdf.rect(x, y, 52, 52);
        try {
          pdf.addImage(image, "PNG", x + 2, y + 2, 48, 48, undefined, "FAST");
        } catch {
          try {
            pdf.addImage(image, "JPEG", x + 2, y + 2, 48, 48, undefined, "FAST");
          } catch {
            pdfText(pdf, `Referencia ${index + 1}`, x + 6, y + 26, { size: 9, maxWidth: 40 });
          }
        }
      });
      pdfText(pdf, "As referencias nao devem ser copiadas; elas servem para decodificar preferencia visual, nivel de acabamento, ritmo de forma e territorio estetico.", 18, y + 72, { size: 11, maxWidth: 174, color: [180, 186, 176], lineHeight: 5.4 });
    }

    const name = sanitizeFileName(data.brandName);
    pdf.save(`${name || "briefing-logo"}-gaijin.pdf`);
  } finally {
    generateButton.disabled = false;
    generateButton.textContent = "Gerar briefing PDF";
  }
}

resizeCanvas();
drawAtmosphere();
window.addEventListener("resize", resizeCanvas);
form.addEventListener("input", updatePreview);
addColorButton.addEventListener("click", () => createColorRow("#39e7ff"));
referenceInput.addEventListener("change", handleReferences);
generateButton.addEventListener("click", generatePdf);

createColorRow("#050505", "Preto base");
createColorRow("#d8ff3f", "Verde acido");
renderReferences();
updatePreview();
