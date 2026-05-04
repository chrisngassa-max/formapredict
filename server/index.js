import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const envPath = resolve(process.cwd(), "server", ".env");

try {
  const envFile = readFileSync(envPath, "utf8");
  for (const line of envFile.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length > 0 && !process.env[key]) {
      process.env[key] = rest.join("=");
    }
  }
} catch {
  // .env is optional. The server still starts and returns a clear setup error.
}

const PORT = Number(process.env.PORT ?? 3001);
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5";

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(payload));
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function buildPrompt({ candidate, projection, localQuestion }) {
  return {
    system: [
      "Tu es un assistant de préqualification de dossiers de financement formation en France.",
      "Tu aides une secrétaire à saisir le minimum utile pour améliorer une projection.",
      "Tu ne promets jamais un financement.",
      "Tu réponds uniquement en JSON strict, sans Markdown.",
      "Si une information manque ou n'est pas sûre, mets confidence à faible et indique À confirmer.",
    ].join(" "),
    user: JSON.stringify({
      task: "Analyse ce dossier et propose la prochaine question utile, les risques et une synthèse courte.",
      expected_schema: {
        summary: "string",
        confidence: "forte | moyenne | faible",
        probable_aids: ["string"],
        next_questions: [
          {
            question: "string",
            field: "keyof Candidate or empty string",
            priority: "haute | moyenne | basse",
            reason: "string",
            target: "secretaire | candidat | employeur | conseiller | financeur",
          },
        ],
        missing_documents: [
          {
            name: "string",
            required_for: "string",
            status: "present | manquant | a_verifier",
          },
        ],
        risk_flags: ["string"],
        projection_comment: "string",
      },
      candidate,
      projection,
      local_next_question: localQuestion,
      legal_constraint:
        "Projection indicative. Ne constitue pas une décision officielle de financement. À vérifier auprès des organismes concernés.",
    }),
  };
}

async function analyzeWithAnthropic(payload) {
  if (!ANTHROPIC_API_KEY) {
    return {
      ok: false,
      mode: "local_fallback",
      error: "ANTHROPIC_API_KEY manquante. Créez server/.env à partir de server/.env.example.",
    };
  }

  const prompt = buildPrompt(payload);
  const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1200,
      system: prompt.system,
      messages: [{ role: "user", content: prompt.user }],
    }),
  });

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    return {
      ok: false,
      mode: "local_fallback",
      error: `Erreur Anthropic ${anthropicResponse.status}: ${errorText}`,
    };
  }

  const data = await anthropicResponse.json();
  const text = data?.content?.[0]?.text ?? "{}";

  try {
    return {
      ok: true,
      mode: "anthropic",
      result: JSON.parse(text),
    };
  } catch {
    return {
      ok: false,
      mode: "local_fallback",
      error: "Réponse IA non JSON. Le mode local doit prendre le relais.",
      raw: text,
    };
  }
}

const server = createServer(async (request, response) => {
  if (request.method === "OPTIONS") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === "POST" && request.url === "/api/analyze") {
    try {
      const payload = await readJsonBody(request);
      const analysis = await analyzeWithAnthropic(payload);
      sendJson(response, analysis.ok ? 200 : 503, analysis);
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        mode: "local_fallback",
        error: error instanceof Error ? error.message : "Erreur serveur inconnue.",
      });
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: "Route introuvable." });
});

server.listen(PORT, () => {
  console.log(`FormaPredict AI server listening on http://localhost:${PORT}`);
});
