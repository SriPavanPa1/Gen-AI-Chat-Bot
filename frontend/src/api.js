
const BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:7070";

export async function reindex() {
  const res = await fetch(`${BASE}/api/ingest`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to ingest");
  return res.json();
}

export async function ask(question) {
  const res = await fetch(`${BASE}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question })
  });
  if (!res.ok) throw new Error("Query failed");
  return res.json();
}
