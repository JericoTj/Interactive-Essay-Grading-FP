"use client";

import { useState, useRef } from "react";
import TitleCard from "@/components/TitleCard";
import { UploadIcon, DownloadIcon } from "@/components/icons";
import { MOCK_ESSAYS } from "@/lib/mock-data";
import type { EssayFile } from "@/lib/types";

function scoreColor(score: number | null): string {
  if (score === null) return "var(--text-muted)";
  if (score >= 85) return "#1a7a3f";
  if (score >= 70) return "#7a4a00";
  return "#8a0000";
}

export default function GraderPage() {
  const [files, setFiles]         = useState<EssayFile[]>(MOCK_ESSAYS);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editScore, setEditScore] = useState("");
  const [checking, setChecking]   = useState(false);
  const uploadRef = useRef<HTMLInputElement>(null);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []).map((f, i) => ({
      id: Date.now() + i,
      name: f.name,
      score: null,
    }));
    setFiles((prev) => [...prev, ...incoming]);
    e.target.value = "";
  }

  function handleCheck() {
    setChecking(true);
    setTimeout(() => {
      setFiles((prev) =>
        prev.map((f) =>
          f.score === null ? { ...f, score: Math.floor(Math.random() * 30 + 62) } : f
        )
      );
      setChecking(false);
    }, 2500);
  }

  function saveEdit(id: number) {
    const s = parseInt(editScore, 10);
    if (!isNaN(s) && s >= 0 && s <= 100) {
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, score: s } : f)));
    }
    setEditingId(null);
  }

  function handleDownload() {
    const rows = ["Name,Score", ...files.map((f) => `${f.name},${f.score ?? "N/A"}`)];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "grades.csv";
    a.click();
  }

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minHeight: 0 }}>
      <TitleCard title="Essay Grader" />

      <div className="content-card grader-card">
        {/* Action buttons — Check | Upload | Download */}
        <div className="grader-actions">
          <button className="btn-blue" onClick={handleCheck} disabled={checking}>
            {checking ? "Grading…" : "Check"}
          </button>
          <button className="btn-blue" onClick={() => uploadRef.current?.click()}>
            <UploadIcon /> Upload
          </button>
          <button className="btn-blue" onClick={handleDownload}>
            <DownloadIcon /> Download
          </button>
          <input type="file" ref={uploadRef} multiple accept=".pdf,.docx,.txt" onChange={handleUpload} style={{ display: "none" }} />
        </div>

        {/* File list */}
        <div className="grader-list">
          <div className="grader-list-scroll">
            {files.map((f) => (
              <div key={f.id} className="essay-row">
                {/* Name pill */}
                <div className="essay-name-pill">{f.name}</div>

                {/* Edit / inline input */}
                {editingId === f.id ? (
                  <div className="edit-input-row">
                    <input
                      className="ee-input"
                      value={editScore}
                      onChange={(e) => setEditScore(e.target.value)}
                      style={{ width: 60, padding: "5px 8px", textAlign: "center" }}
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && saveEdit(f.id)}
                    />
                    <button
                      className="btn-blue"
                      style={{ padding: "5px 12px", fontSize: 12 }}
                      onClick={() => saveEdit(f.id)}
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  <button
                    className="essay-edit-btn"
                    onClick={() => { setEditingId(f.id); setEditScore(f.score?.toString() ?? ""); }}
                  >
                    Edit
                  </button>
                )}

                {/* Score badge */}
                <div className="essay-score-badge" style={{ color: scoreColor(f.score) }}>
                  {f.score !== null ? `${f.score}%` : "??%"}
                </div>
              </div>
            ))}
          </div>

          {/* Drop zone */}
          <div className="drop-zone" onClick={() => uploadRef.current?.click()}>
            <UploadIcon /> Upload or Drag files here
          </div>
        </div>
      </div>
    </div>
  );
}
