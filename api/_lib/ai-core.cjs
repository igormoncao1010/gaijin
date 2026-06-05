const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || "";
const hfModel = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";
const hfVisionModel = process.env.HF_VISION_MODEL || "Salesforce/blip-image-captioning-base";
const hfImageModel = process.env.HF_IMAGE_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";

function fallbackAnalysis(input = {}) {
  const business = input.business || "marca";
  const goal = input.goal || "ganhar presenca digital";
  const vibe = input.vibe || "cinematografica, moderna e memoravel";

  return {
    mode: "fallback",
    diagnosis: `A ${business} precisa de uma presenca digital que pareca menos vitrine e mais experiencia. O objetivo central e ${goal}, entao a comunicacao deve reduzir ruido, ampliar contraste e conduzir o visitante ate uma acao clara.`,
    visualDirection: `Direcao ${vibe}: fundo escuro, cortes de luz, tipografia grande, microinteracoes, narrativa por cenas e contato com cara de transmissao.`,
    siteStructure: [
      "Abertura cinematografica",
      "Reator de servicos",
      "Arquivo visual com cases",
      "Diagnostico inteligente",
      "Contato final direto",
    ],
    whatsappMessage: `Oi, quero iniciar um projeto com a Gaijin. Segmento: ${business}. Objetivo: ${goal}. Direcao desejada: ${vibe}.`,
  };
}

function buildSuiteFallback(task, input = {}) {
  const business = input.business || "marca";
  const goal = input.goal || "ganhar presenca digital";
  const vibe = input.vibe || "cinematografica e tecnologica";

  if (task === "score") {
    return {
      mode: "fallback",
      title: "Score de impacto",
      score: { impact: 91, clarity: 78, premium: 86, urgency: "alta" },
      summary: `A ${business} tem potencial para parecer muito mais memoravel se transformar ${goal} em uma experiencia guiada por cenas.`,
      actions: ["Reforcar a promessa central", "Criar CTA com cara de transmissao", "Usar cases como prova visual", "Aumentar narrativa de marca"],
    };
  }

  if (task === "proposal") {
    return {
      mode: "fallback",
      title: "Proposta gerada",
      summary: `Projeto recomendado para ${business}: experiencia digital ${vibe}, focada em ${goal}.`,
      phases: ["Imersao", "Direcao visual", "Design de interface", "Desenvolvimento", "Publicacao"],
      deliverables: ["Site responsivo", "Sistema visual", "Microinteracoes", "Integracao com WhatsApp", "Guia rapido"],
      estimate: "3 a 6 semanas, dependendo do escopo final.",
    };
  }

  if (task === "moodboard") {
    return {
      mode: "fallback",
      title: "Moodboard textual",
      palette: ["#050505", "#f8f4ea", "#d8ff3f", "#39e7ff", "#ff3d7f"],
      visualLanguage: `Fundo escuro, luzes direcionais, tipografia gigante, textura de filme e interface HUD para criar sensacao ${vibe}.`,
      motion: ["Cortes secos entre cenas", "Glow reativo ao mouse", "Cards em profundidade", "Particulas sutis"],
      prompts: [`cinematic brand website for ${business}, dark futuristic interface`, `abstract luxury technology moodboard for ${business}`],
    };
  }

  if (task === "personalize") {
    return {
      mode: "fallback",
      title: "Pagina personalizada",
      headline: `${business} nao precisa de mais um site. Precisa de presenca.`,
      subhead: `Uma experiencia digital para ${goal}, com linguagem ${vibe} e conversao direta para contato.`,
      cta: "Criar minha experiencia",
      sections: ["Manifesto", "Prova visual", "Diagnostico", "Oferta recomendada"],
    };
  }

  return {
    mode: "fallback",
    title: "Resposta do concierge",
    answer: `Para ${business}, eu recomendaria comecar por uma experiencia digital focada em ${goal}, com visual ${vibe}.`,
    nextQuestion: "Qual e o maior problema do site ou identidade atual?",
  };
}

function extractJson(text) {
  const fenced = String(text).match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] || String(text);
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) throw new Error("Resposta sem JSON.");
  return JSON.parse(raw.slice(start, end + 1));
}

async function callTextJson(prompt, maxNewTokens = 760) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: maxNewTokens, temperature: 0.68, return_full_text: false },
    }),
  });

  if (!response.ok) throw new Error(`Hugging Face retornou ${response.status}.`);
  const payload = await response.json();
  const generated = Array.isArray(payload) ? payload[0]?.generated_text : payload.generated_text || payload[0]?.generated_text;
  if (!generated) throw new Error("Resposta vazia do Hugging Face.");
  return extractJson(generated);
}

async function handleAiSuite(input = {}) {
  const task = String(input.task || "chat").slice(0, 40);
  const cleanInput = {
    business: String(input.business || "").slice(0, 800),
    goal: String(input.goal || "").slice(0, 800),
    vibe: String(input.vibe || "").slice(0, 800),
    notes: String(input.notes || "").slice(0, 1600),
    question: String(input.question || "").slice(0, 1200),
  };

  if (!hfToken) return buildSuiteFallback(task, cleanInput);

  const prompt = `[INST]
Voce e estrategista senior da Gaijin Creative. Responda SOMENTE em JSON valido, sem markdown.
Tarefa: ${task}
Contexto:
- Segmento/marca: ${cleanInput.business || "nao informado"}
- Objetivo: ${cleanInput.goal || "nao informado"}
- Vibe: ${cleanInput.vibe || "nao informado"}
- Observacoes: ${cleanInput.notes || "nao informado"}
- Pergunta do visitante: ${cleanInput.question || "nao informado"}

Se task=score, retorne {"title":"","score":{"impact":0-100,"clarity":0-100,"premium":0-100,"urgency":""},"summary":"","actions":["","","",""]}.
Se task=proposal, retorne {"title":"","summary":"","phases":[""],"deliverables":[""],"estimate":""}.
Se task=moodboard, retorne {"title":"","palette":["#hex"],"visualLanguage":"","motion":[""],"prompts":[""]}.
Se task=personalize, retorne {"title":"","headline":"","subhead":"","cta":"","sections":[""]}.
Se task=chat, retorne {"title":"","answer":"","nextQuestion":""}.
[/INST]`;

  try {
    return { mode: "huggingface", ...(await callTextJson(prompt)) };
  } catch (error) {
    return { ...buildSuiteFallback(task, cleanInput), warning: error.message };
  }
}

async function handleAiBrief(input = {}) {
  const cleanInput = {
    business: String(input.business || "").slice(0, 800),
    goal: String(input.goal || "").slice(0, 800),
    vibe: String(input.vibe || "").slice(0, 800),
    notes: String(input.notes || "").slice(0, 1600),
  };

  if (!hfToken) return fallbackAnalysis(cleanInput);

  const prompt = `[INST]
Voce e estrategista criativo senior da Gaijin Creative. Analise o briefing e responda SOMENTE em JSON valido.
Briefing:
- Segmento/negocio: ${cleanInput.business || "nao informado"}
- Objetivo: ${cleanInput.goal || "nao informado"}
- Vibe desejada: ${cleanInput.vibe || "nao informado"}
- Observacoes: ${cleanInput.notes || "nao informado"}
Formato: {"diagnosis":"","visualDirection":"","siteStructure":[""],"whatsappMessage":""}
[/INST]`;

  try {
    return { mode: "huggingface", ...(await callTextJson(prompt, 650)) };
  } catch (error) {
    return { ...fallbackAnalysis(cleanInput), mode: "fallback", warning: error.message };
  }
}

function buildLogoAnalysisFromStats(context, stats = {}) {
  const width = Number(stats.width || 0);
  const height = Number(stats.height || 0);
  const aspectRatio = Number(stats.aspectRatio || (width && height ? width / height : 1));
  const transparentRatio = Number(stats.transparentRatio || 0);
  const colorfulness = Number(stats.colorfulness || 0);
  const contrast = Number(stats.contrast || 0);
  const darkRatio = Number(stats.darkRatio || 0);
  const lightRatio = Number(stats.lightRatio || 0);
  const dominantColors = Array.isArray(stats.dominantColors) ? stats.dominantColors.slice(0, 4) : [];

  const format = aspectRatio > 1.7 ? "horizontal" : aspectRatio < 0.72 ? "vertical" : "compacto";
  const strengths = [];
  const risks = [];
  const recommendations = [];

  strengths.push(`Arquivo analisado com proporcao ${format}${width && height ? ` (${width}x${height}px)` : ""}.`);
  if (transparentRatio > 0.12) strengths.push("Boa base para aplicar em fundos cinematograficos, porque o arquivo parece ter area transparente ou respiro visual.");
  else risks.push("O logo parece ter pouco respiro/transparencia; pode precisar de uma versao isolada para fundos escuros e animacoes.");

  if (contrast > 0.42) strengths.push("Contraste visual forte, bom para leitura rapida em hero, cards e chamadas de impacto.");
  else risks.push("Contraste moderado; pode perder forca em telas pequenas ou sobre videos/fundos texturizados.");

  if (colorfulness > 0.28) strengths.push("Paleta com presenca cromatica, boa para criar acentos, luzes e microinteracoes no site.");
  else recommendations.push("Criar uma cor de apoio mais marcante para botoes, estados ativos e detalhes de interface.");

  if (darkRatio > 0.62) risks.push("Predominio escuro: preparar versao clara/monocromatica para fundos pretos.");
  if (lightRatio > 0.62) risks.push("Predominio claro: preparar versao escura para fundos claros e materiais impressos.");

  recommendations.push("Criar versoes horizontal, vertical, reduzida e monocromatica.");
  recommendations.push("Testar leitura em tamanhos pequenos, principalmente favicon, menu mobile e cards de projeto.");
  recommendations.push("Definir area de seguranca ao redor do simbolo para o logo respirar em layouts cinematograficos.");
  if (dominantColors.length) recommendations.push(`Usar cores dominantes como ponto de partida: ${dominantColors.join(", ")}.`);

  return {
    mode: "local-analysis",
    title: "Analise visual de logo",
    caption: "Analise feita a partir da imagem enviada: proporcao, contraste, transparencia, brilho e cores dominantes.",
    strengths: strengths.slice(0, 4),
    risks: risks.length ? risks.slice(0, 4) : ["Validar legibilidade sobre fundos com video, textura e brilho.", "Checar se o simbolo continua reconhecivel em favicon e mobile."],
    recommendations: recommendations.slice(0, 5),
  };
}

async function handleLogoAnalysis(input = {}) {
  const context = {
    business: String(input.business || "").slice(0, 500),
    goal: String(input.goal || "").slice(0, 500),
    fileName: String(input.fileName || "logo").slice(0, 180),
  };

  if (!input.imageData) {
    return buildLogoAnalysisFromStats(context, input.imageStats);
  }

  if (!hfToken) {
    return buildLogoAnalysisFromStats(context, input.imageStats);
  }

  try {
    const base64 = String(input.imageData).split(",").pop() || input.imageData;
    const visionResponse = await fetch(`https://api-inference.huggingface.co/models/${hfVisionModel}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/octet-stream" },
      body: Uint8Array.from(Buffer.from(base64, "base64")),
    });
    if (!visionResponse.ok) throw new Error(`Vision retornou ${visionResponse.status}.`);
    const visionPayload = await visionResponse.json();
    const caption = Array.isArray(visionPayload) ? visionPayload[0]?.generated_text || "" : visionPayload.generated_text || "";
    const prompt = `[INST]Analise este logo para um site cinematografico. Responda SOMENTE JSON. Descricao visual: ${caption}. Formato: {"title":"","caption":"","strengths":[""],"risks":[""],"recommendations":[""]}[/INST]`;
    return { mode: "huggingface", ...(await callTextJson(prompt)) };
  } catch (error) {
    try {
      const prompt = `[INST]
O modelo visual da Hugging Face falhou ao tentar ler uma imagem de logo, mas o arquivo foi enviado pelo usuario.
Crie uma analise estrategica util em portugues, deixando claro que a leitura dos pixels nao foi concluida.
Contexto:
- Marca/segmento: ${context.business || "nao informado"}
- Objetivo: ${context.goal || "nao informado"}
- Arquivo: ${context.fileName}
- Erro tecnico: ${error.message}
Responda SOMENTE JSON neste formato:
{"title":"","caption":"","strengths":[""],"risks":[""],"recommendations":[""]}
[/INST]`;
      return {
        mode: "huggingface",
        ...(await callTextJson(prompt, 520)),
        warning: error.message,
      };
    } catch {
      // Fall through to deterministic fallback.
    }

    return buildLogoAnalysisFromStats(context, input.imageStats);
  }
}

async function handleMoodboardImage(input = {}) {
  const prompt = String(input.prompt || "").slice(0, 1200);
  if (!hfToken || !prompt) {
    return { mode: "fallback", prompt, image: "", message: "Configure HF_TOKEN e HF_IMAGE_MODEL para gerar imagem." };
  }

  try {
    const imageResponse = await fetch(`https://api-inference.huggingface.co/models/${hfImageModel}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${hfToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({ inputs: prompt }),
    });
    if (!imageResponse.ok) throw new Error(`Imagem retornou ${imageResponse.status}.`);
    const contentType = imageResponse.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    return { mode: "huggingface", prompt, image: `data:${contentType};base64,${buffer.toString("base64")}` };
  } catch (error) {
    return { mode: "fallback", prompt, image: "", message: "Nao consegui gerar a imagem agora, mas o prompt esta pronto.", warning: error.message };
  }
}

module.exports = {
  handleAiBrief,
  handleAiSuite,
  handleLogoAnalysis,
  handleMoodboardImage,
};
