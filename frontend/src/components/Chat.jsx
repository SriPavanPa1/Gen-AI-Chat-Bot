
import React, { useState } from "react";
import { ask, reindex } from "../api";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [sources, setSources] = useState([]);
  const [info, setInfo] = useState("");

  async function onAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");
    setSources([]);
    setInfo("");

    try {
      const res = await ask(question.trim());
      setAnswer(res.answer || "(no answer)");
      setSources(res.sources || []);
    } catch (err) {
      console.error(err);
      setInfo(String(err));
    } finally {
      setLoading(false);
    }
  }

  async function onReindex() {
    setLoading(true);
    setInfo("Re-indexing docs...");
    try {
      const res = await reindex();
      setInfo(`Indexed ${res.count} chunks from ${res.files?.length ?? 0} files.`);
    } catch (e) {
      setInfo(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ background: "#0f1733", border: "1px solid #1e2a4a", borderRadius: 16, padding: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <form onSubmit={onAsk} style={{ display: "flex", gap: 8, flex: 1 }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder="Ask about your docs…"
            style={{ flex: 1, padding: "12px 14px", borderRadius: 10, border: "1px solid #2a3963", background: "#0b132b", color: "#e8ebf7" }}
          />
          <button disabled={loading} style={{ padding: "12px 14px", borderRadius: 10, background: "#2a72ff", color: "white", border: 0, cursor: "pointer" }}>
            {loading ? "Thinking…" : "Ask"}
          </button>
        </form>
        <button onClick={onReindex} disabled={loading} title="Re-index documents"
          style={{ padding: "12px 14px", borderRadius: 10, background: "#22335b", color: "white", border: 0, cursor: "pointer" }}>
          Re-index
        </button>
      </div>

      {info && <div style={{ marginBottom: 10, fontSize: 13, opacity: 0.8 }}>{info}</div>}

      {answer && (
        <div>
          <h3 style={{ marginTop: 10 }}>Answer</h3>
          <div style={{ whiteSpace: "pre-wrap", background: "#0b132b", padding: 12, borderRadius: 10, border: "1px solid #1e2a4a" }}>
            {answer}
          </div>

          {sources?.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <h4>Top sources</h4>
              <ul>
                {sources.map(s => (
                  <li key={s.id} style={{ marginBottom: 6 }}>
                    <code>{s.source}</code> — score {s.score} — <span style={{ opacity: 0.8 }}>{s.preview}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
