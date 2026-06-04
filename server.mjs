import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT || 4173);
const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || "";
const hfModel = process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.3";
const hfVisionModel = process.env.HF_VISION_MODEL || "Salesforce/blip-image-captioning-base";
const hfImageModel = process.env.HF_IMAGE_MODEL || "stabilityai/stable-diffusion-xl-base-1.0";

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".mp4": "video/mp4",
  ".glb": "model/gltf-binary",
  ".ico": "image/x-icon",
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 80_000) {
        reject(new Error("Payload muito grande."));
        request.destroy();
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

function fallbackAnalysis({ business = "", goal = "", vibe = "", notes = "" }) {
  const area = business || "marca";
  const objective = goal || "ganhar presenca digital";
  const energy = vibe || "cinematografica, moderna e memoravel";
  const extra = notes ? ` O ponto de partida informado foi: ${notes}` : "";

  return {
    mode: "fallback",
    diagnosis: `A ${area} precisa de uma presenca digital que pareca menos vitrine e mais experiencia. O objetivo central e ${objective}, entao a comunicacao deve reduzir ruido, ampliar contraste e conduzir o visitante ate uma acao clara.${extra}`,
    visualDirection: `Direcao ${energy}: fundo escuro, cortes de luz, tipografia grande, microinteracoes, narrativa por cenas e um launchpad de contato que pareca uma transmissao.`,
    siteStructure: [
      "Abertura cinematografica com manifesto curto",
      "Reator de servicos que muda a narrativa conforme a necessidade",
      "Arquivo visual com cases em tela cheia",
      "Diagnostico inteligente antes do WhatsApp",
      "Contato final com chamada direta e memoravel",
    ],
    whatsappMessage: `Oi, quero iniciar um projeto com a Gaijin. Segmento: ${area}. Objetivo: ${objective}. Direcao desejada: ${energy}. Observacoes: ${notes || "quero uma experiencia visual forte e tecnologica"}.`,
  };
}

function buildSuiteFallback(task, input) {
  const business = input.business || "marca";
  const goal = input.goal || "ganhar presenca digital";
  const vibe = input.vibe || "cinematografica e tecnologica";

  if (task === "score") {
    return {
      mode: "fallback",
      title: "Score de impacto",
      score: {
        impact: 91,
        clarity: 78,
        premium: 86,
        urgency: "alta",
      },
      summary: `A ${business} tem potencial para parecer muito mais memoravel se transformar ${goal} em uma experiencia guiada por cenas, nao apenas em uma pagina comum.`,
      actions: [
        "Reforcar uma promessa central logo na abertura",
        "Criar um CTA com cara de transmissao, nao de formulario",
        "Usar cases como prova visual em tela cheia",
        "Reduzir textos frios e aumentar narrativa de marca",
      ],
    };
  }

  if (task === "proposal") {
    return {
      mode: "fallback",
      title: "Proposta gerada",
      summary: `Projeto recomendado para ${business}: experiencia digital ${vibe}, focada em ${goal}.`,
      phases: [
        "Imersao e diagnostico de marca",
        "Direcao visual e narrativa do site",
        "Design de interface cinematografica",
        "Desenvolvimento responsivo e interacoes",
        "Publicacao, ajustes e entrega final",
      ],
      deliverables: [
        "Site responsivo",
        "Sistema visual de interface",
        "Microinteracoes e cenas de scroll",
        "Integração com WhatsApp",
        "Guia rapido de uso",
      ],
      estimate: "3 a 6 semanas, dependendo do escopo final.",
    };
  }

  if (task === "moodboard") {
    return {
      mode: "fallback",
      title: "Moodboard textual",
      palette: ["#050505", "#f8f4ea", "#d8ff3f", "#39e7ff", "#ff3d7f"],
      visualLanguage: `Fundo escuro, luzes direcionais, tipografia gigante, textura de filme, interface HUD e momentos de contraste acido para criar sensacao ${vibe}.`,
      motion: [
        "Cortes secos entre cenas",
        "Glow reativo ao mouse",
        "Cards em profundidade",
        "Scanlines e particulas sutis",
      ],
      prompts: [
        `cinematic brand website for ${business}, dark futuristic interface, acid green highlights, premium visual system`,
        `abstract luxury technology moodboard for ${business}, dramatic lighting, editorial typography`,
      ],
    };
  }

  if (task === "personalize") {
    return {
      mode: "fallback",
      title: "Pagina personalizada",
      headline: `${business} nao precisa de mais um site. Precisa de presenca.`,
      subhead: `Uma experiencia digital para ${goal}, com linguagem ${vibe} e conversao direta para contato.`,
      cta: "Criar minha experiencia",
      sections: [
        "Manifesto de abertura",
        "Prova visual",
        "Diagnostico interativo",
        "Oferta recomendada",
      ],
    };
  }

  return {
    mode: "fallback",
    title: "Resposta do concierge",
    answer: `Para ${business}, eu recomendaria comecar por uma experiencia digital focada em ${goal}, com visual ${vibe}. O melhor pacote seria um site cinematografico com diagnostico, cases fortes e CTA direto.`,
    nextQuestion: "Qual e o maior problema do site ou identidade atual?",
  };
}

async function callTextJson(prompt) {
  const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 760,
        temperature: 0.68,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face retornou ${response.status}.`);
  }

  const payload = await response.json();
  const generated = Array.isArray(payload)
    ? payload[0]?.generated_text
    : payload.generated_text || payload[0]?.generated_text;
  if (!generated) throw new Error("Resposta vazia do Hugging Face.");
  return extractJson(generated);
}

function extractJson(text) {
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const raw = fenced?.[1] || text;
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Resposta sem JSON.");
  }
  return JSON.parse(raw.slice(start, end + 1));
}

async function callHuggingFace(input) {
  const prompt = `[INST]
Voce e estrategista criativo senior da Gaijin Creative, uma agencia de design, identidade e sites cinematograficos.
Analise o briefing abaixo e responda SOMENTE em JSON valido, sem markdown.

Briefing:
- Segmento/negocio: ${input.business || "nao informado"}
- Objetivo: ${input.goal || "nao informado"}
- Vibe desejada: ${input.vibe || "nao informado"}
- Observacoes: ${input.notes || "nao informado"}

Formato obrigatorio:
{
  "diagnosis": "diagnostico de marca em portugues, com 2 a 4 frases",
  "visualDirection": "direcao visual cinematografica em portugues, com 2 a 4 frases",
  "siteStructure": ["5 secoes recomendadas, curtas"],
  "whatsappMessage": "mensagem pronta para enviar no WhatsApp, objetiva e com contexto do projeto"
}
[/INST]`;

  const response = await fetch(`https://api-inference.huggingface.co/models/${hfModel}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        max_new_tokens: 650,
        temperature: 0.72,
        return_full_text: false,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face retornou ${response.status}.`);
  }

  const payload = await response.json();
  const generated = Array.isArray(payload)
    ? payload[0]?.generated_text
    : payload.generated_text || payload[0]?.generated_text;

  if (!generated) {
    throw new Error("Resposta vazia do Hugging Face.");
  }

  return { mode: "huggingface", ...extractJson(generated) };
}

async function handleAiSuite(request, response) {
  try {
    const body = await readRequestBody(request);
    const input = JSON.parse(body || "{}");
    const task = String(input.task || "chat").slice(0, 40);
    const cleanInput = {
      business: String(input.business || "").slice(0, 800),
      goal: String(input.goal || "").slice(0, 800),
      vibe: String(input.vibe || "").slice(0, 800),
      notes: String(input.notes || "").slice(0, 1600),
      question: String(input.question || "").slice(0, 1200),
    };

    if (!hfToken) {
      sendJson(response, 200, buildSuiteFallback(task, cleanInput));
      return;
    }

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
      sendJson(response, 200, { mode: "huggingface", ...(await callTextJson(prompt)) });
    } catch (error) {
      sendJson(response, 200, {
        ...buildSuiteFallback(task, cleanInput),
        warning: error.message,
      });
    }
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function callVisionCaption(imageData) {
  const base64 = imageData.split(",").pop() || imageData;
  const binary = Uint8Array.from(Buffer.from(base64, "base64"));
  const response = await fetch(`https://api-inference.huggingface.co/models/${hfVisionModel}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${hfToken}`,
      "Content-Type": "application/octet-stream",
    },
    body: binary,
  });
  if (!response.ok) throw new Error(`Vision retornou ${response.status}.`);
  const payload = await response.json();
  return Array.isArray(payload) ? payload[0]?.generated_text || "" : payload.generated_text || "";
}

async function handleLogoAnalysis(request, response) {
  try {
    const body = await readRequestBody(request);
    const input = JSON.parse(body || "{}");
    const context = {
      business: String(input.business || "").slice(0, 500),
      goal: String(input.goal || "").slice(0, 500),
      fileName: String(input.fileName || "logo").slice(0, 180),
    };

    if (!hfToken || !input.imageData) {
      sendJson(response, 200, {
        mode: "fallback",
        title: "Analise de logo",
        caption: `Arquivo recebido: ${context.fileName}.`,
        strengths: ["Base visual pronta para evoluir", "Pode ser conectada a uma narrativa digital mais forte"],
        risks: ["Verificar leitura em tamanho pequeno", "Testar contraste em fundos escuros e claros"],
        recommendations: ["Criar versao monocromatica", "Definir area de respiro", "Testar aplicacao em hero cinematografico"],
      });
      return;
    }

    try {
      const caption = await callVisionCaption(input.imageData);
      const prompt = `[INST]
Analise este logo para um site cinematografico da Gaijin Creative. Responda SOMENTE JSON.
Contexto: marca=${context.business || "nao informado"}, objetivo=${context.goal || "nao informado"}.
Descricao visual gerada pelo modelo: ${caption}
Formato: {"title":"","caption":"","strengths":[""],"risks":[""],"recommendations":[""]}
[/INST]`;
      sendJson(response, 200, { mode: "huggingface", ...(await callTextJson(prompt)) });
    } catch (error) {
      sendJson(response, 200, {
        mode: "fallback",
        title: "Analise de logo",
        caption: `Nao consegui consultar o modelo visual agora. Arquivo: ${context.fileName}.`,
        strengths: ["Material enviado com sucesso", "Pode ser usado como ponto de partida para direcao visual"],
        risks: ["Confirmar legibilidade", "Validar contraste", "Checar aplicacao em mobile"],
        recommendations: ["Preparar versao horizontal e vertical", "Criar motion reveal", "Testar em fundos cinematograficos"],
        warning: error.message,
      });
    }
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handleMoodboardImage(request, response) {
  try {
    const body = await readRequestBody(request);
    const input = JSON.parse(body || "{}");
    const prompt = String(input.prompt || "").slice(0, 1200);

    if (!hfToken || !prompt) {
      sendJson(response, 200, {
        mode: "fallback",
        prompt,
        image: "",
        message: "Configure HF_TOKEN e um HF_IMAGE_MODEL compatível para gerar imagem.",
      });
      return;
    }

    try {
      const imageResponse = await fetch(`https://api-inference.huggingface.co/models/${hfImageModel}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: prompt }),
      });

      if (!imageResponse.ok) throw new Error(`Imagem retornou ${imageResponse.status}.`);
      const contentType = imageResponse.headers.get("content-type") || "image/png";
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      sendJson(response, 200, {
        mode: "huggingface",
        prompt,
        image: `data:${contentType};base64,${buffer.toString("base64")}`,
      });
    } catch (error) {
      sendJson(response, 200, {
        mode: "fallback",
        prompt,
        image: "",
        message: "Nao consegui gerar a imagem agora, mas o prompt esta pronto.",
        warning: error.message,
      });
    }
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function handleAiBrief(request, response) {
  try {
    const body = await readRequestBody(request);
    const input = JSON.parse(body || "{}");
    const cleanInput = {
      business: String(input.business || "").slice(0, 800),
      goal: String(input.goal || "").slice(0, 800),
      vibe: String(input.vibe || "").slice(0, 800),
      notes: String(input.notes || "").slice(0, 1600),
    };

    if (!hfToken) {
      sendJson(response, 200, fallbackAnalysis(cleanInput));
      return;
    }

    try {
      sendJson(response, 200, await callHuggingFace(cleanInput));
    } catch (error) {
      sendJson(response, 200, {
        ...fallbackAnalysis(cleanInput),
        mode: "fallback",
        warning: error.message,
      });
    }
  } catch (error) {
    sendJson(response, 400, { error: error.message });
  }
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = url.pathname === "/" ? "/index.html" : decodeURIComponent(url.pathname);
  const safePath = normalize(requestedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, safePath);

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, { "Content-Type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/ai-brief") {
    handleAiBrief(request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/api/ai-suite") {
    handleAiSuite(request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/api/logo-analysis") {
    handleLogoAnalysis(request, response);
    return;
  }

  if (request.method === "POST" && request.url === "/api/moodboard-image") {
    handleMoodboardImage(request, response);
    return;
  }

  if (request.method === "GET" || request.method === "HEAD") {
    serveStatic(request, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
}).listen(port, () => {
  console.log(`Gaijin Creative rodando em http://localhost:${port}`);
});
