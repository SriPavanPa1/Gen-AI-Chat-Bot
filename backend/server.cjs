
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { pipeline, env } = require("@xenova/transformers");
const { v4: uuidv4 } = require("uuid");

env.allowLocalModels = true;
env.localModelPath = path.join(__dirname, ".cache");

const DOCS_DIR = path.join(__dirname, "docs");
const STORE_PATH = path.join(__dirname, "vectorstore.json");

const app = express();
app.use(cors());
app.use(express.json({ limit: "15mb" }));

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}
function chunkText(text, maxChars = 900, overlap = 150) {
  // Prevent invalid overlap
  if (typeof text !== 'string' || text.length === 0) return [];
  if (typeof maxChars !== 'number' || maxChars <= 0) maxChars = 900;
  if (typeof overlap !== 'number' || overlap < 0) overlap = 0;
  if (overlap >= maxChars) overlap = Math.floor(maxChars / 2);
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    if (end <= start || maxChars <= 0) break;
    chunks.push(text.slice(start, end));
    // Prevent infinite loop
    if (end === text.length) break;
    start = end - overlap;
    if (start < 0) start = 0;
  }
  return chunks;
}
function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

async function ensurePipelines() {
  if (!global.embedder) {
    global.embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  if (!global.qa) {
    global.qa = await pipeline("question-answering", "Xenova/distilbert-base-uncased-distilled-squad");
  }
}

async function ingestDocs() {
  await ensurePipelines();
  const files = fs.readdirSync(DOCS_DIR).filter(f => !f.startsWith("."));
  const entries = [];
  for (const f of files) {
    const full = path.join(DOCS_DIR, f);
    if (!fs.statSync(full).isFile()) continue;
    let raw = fs.readFileSync(full, "utf-8");
    let text = f.endsWith(".html") ? stripHtml(raw) : raw;
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      const embedding = await global.embedder(chunk, { pooling: "mean", normalize: true });
      entries.push({ id: uuidv4(), source: f, text: chunk, embedding: Array.from(embedding.data) });
    }
  }
  fs.writeFileSync(STORE_PATH, JSON.stringify({ entries }, null, 2));
  return { count: entries.length, files };
}

async function answerQuestion(question, k = 5) {
  await ensurePipelines();
  if (!fs.existsSync(STORE_PATH)) throw new Error("No vectorstore. Run ingest first.");
  const store = JSON.parse(fs.readFileSync(STORE_PATH));
  const qvec = await global.embedder(question, { pooling: "mean", normalize: true });
  const qarr = Array.from(qvec.data);
  const ranked = store.entries.map(e => ({ ...e, score: cosineSim(qarr, e.embedding) }))
    .sort((a, b) => b.score - a.score).slice(0, k);
  const context = ranked.map(r => r.text).join("\n\n").slice(0, 6000);
  let answer = "";
  try {
    const out = await global.qa({ question, context });
    answer = out?.answer || "";
  } catch { answer = ranked[0]?.text?.slice(0, 500) || "No answer found."; }
  return { answer, sources: ranked };
}

app.post("/api/ingest", async (req, res) => {
  try { res.json(await ingestDocs()); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.post("/api/query", async (req, res) => {
  try { res.json(await answerQuestion(req.body.question)); } catch (e) { res.status(500).json({ error: e.message }); }
});
app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 7070;
if (process.argv.includes("--ingest-only")) {
  ingestDocs().then(r => { console.log("Ingested", r); process.exit(0); });
} else {
  app.listen(PORT, () => console.log("Server http://localhost:" + PORT));
}
