
import React, { useState } from "react";
import Chat from "./components/Chat";

export default function App() {
  return (
    <div style={{ fontFamily: "Inter, system-ui, Arial", minHeight: "100vh", background: "#0b1020", color: "#e8ebf7" }}>
      <header style={{ padding: "18px 20px", borderBottom: "1px solid #1e2a4a" }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>🧠 AI Knowledge Bot</h1>
        <p style={{ margin: 0, opacity: 0.8 }}>Ask questions about your internal docs.</p>
      </header>
      <main style={{ maxWidth: 920, margin: "0 auto", padding: 20 }}>
        <Chat />
        <section style={{ marginTop: 28, opacity: 0.85, fontSize: 14 }}>
          <h3>Sample questions to try</h3>
          <ul>
            <li>How do I run the project locally?</li>
            <li>Who owns the Payments API and what's their Slack channel?</li>
            <li>Where are logs stored and when are backups?</li>
          </ul>
        </section>
        <section style={{ marginTop: 28, opacity: 0.8, fontSize: 13 }}>
          <h3>Tips</h3>
          <ul>
            <li>Drop more docs into <code>backend/docs/</code> then click "Re-index".</li>
            <li>Answers include top sources and similarity scores.</li>
          </ul>
        </section>
      </main>
      <footer style={{ padding: 16, textAlign: "center", opacity: 0.6 }}>
        Built with free local models via transformers.js (no API keys).
      </footer>
    </div>
  );
}
