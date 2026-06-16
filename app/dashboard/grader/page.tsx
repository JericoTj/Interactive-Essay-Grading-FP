"use client";

import { useState, useEffect, useRef } from "react";
import TitleCard from "@/components/TitleCard";
import { UploadIcon, DownloadIcon } from "@/components/icons";

interface Essay {
  id: number;
  title: string;
  content: string;
  fileName: string | null;
  fileUrl: string | null;
  fileKey: string | null;  
  gradingResult: {
    overallScore: number;
    overallFeedback: string;
    grammarScore: number;
    grammarFeedback: string;
    structureScore: number;
    structureFeedback: string;
    clarityScore: number;
    clarityFeedback: string;
    annotations: string;
  } | null;
}

interface Rubric {
  id: number;
  name: string;
  fileName: string | null;
}

interface ViewingEssay {
  essay: Essay;
}

function scoreColor(score: number | null): string {
  if (score === null) return "var(--text-muted)";
  if (score >= 85) return "#1a7a3f";
  if (score >= 70) return "#7a4a00";
  return "#8a0000";
}

function EssayModal({ viewing, onClose }: { viewing: ViewingEssay; onClose: () => void }) {
  const { essay } = viewing;
  const gr = essay.gradingResult;
  const annotations = gr ? JSON.parse(gr.annotations) : [];
  const [content, setContent] = useState(essay.content || "");
  const [loadingContent, setLoadingContent] = useState(!essay.content && !!essay.fileKey);

  useEffect(() => {
    if (!essay.content && essay.fileKey) {
      const token = localStorage.getItem("token");
      fetch(`/api/essays/${essay.id}/content`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((r) => r.json())
        .then((d) => setContent(d.content ?? ""))
        .catch(() => setContent("Failed to load content."))
        .finally(() => setLoadingContent(false));
    }
  }, [essay]);

  const scoreColor = (s: number) => s >= 85 ? "#1a7a3f" : s >= 70 ? "#7a4a00" : "#8a0000";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{essay.title}</h2>
          <button className="essay-edit-btn" onClick={onClose}>✕ Close</button>
        </div>
        <div className="modal-body">
          {/* Left — essay text */}
          <div className="modal-left">
            <div className="modal-section-label">Essay Text</div>
            {loadingContent
              ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Extracting text…</p>
              : <p className="modal-essay-text">{content || "No content available."}</p>
            }
          </div>

          {/* Right — scores */}
          <div className="modal-right">
            {gr ? (
              <>
                <div className="modal-section-label">Grading Result</div>
                <div className="modal-score-big" style={{ color: scoreColor(gr.overallScore) }}>
                  {gr.overallScore}%
                </div>
                <p className="modal-feedback">{gr.overallFeedback}</p>

                {[
                  { name: "Grammar",   score: gr.grammarScore,   feedback: gr.grammarFeedback },
                  { name: "Structure", score: gr.structureScore, feedback: gr.structureFeedback },
                  { name: "Clarity",   score: gr.clarityScore,   feedback: gr.clarityFeedback },
                ].map((c) => (
                  <div key={c.name} className="modal-criterion">
                    <div className="modal-criterion-header">
                      <span>{c.name}</span>
                      <span style={{ color: scoreColor(c.score) }}>{c.score}/100</span>
                    </div>
                    <div className="score-bar-track" style={{ marginBottom: 6 }}>
                      <div className="score-bar-fill" style={{ width: `${c.score}%`, background: scoreColor(c.score) }} />
                    </div>
                    <p className="criterion-feedback">{c.feedback}</p>
                  </div>
                ))}

                {annotations.length > 0 && (
                  <>
                    <div className="modal-section-label" style={{ marginTop: 16 }}>Annotations</div>
                    {annotations.map((a: any, i: number) => (
                      <div key={i} className="modal-annotation">
                        <div className="modal-annotation-type">{a.issue}</div>
                        <p className="modal-annotation-sentence">"{a.sentence}"</p>
                        <p className="modal-annotation-suggestion">→ {a.suggestion}</p>
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)", fontSize: 13 }}>
                Not graded yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GraderPage() {
  const [essays, setEssays]         = useState<Essay[]>([]);
  const [rubrics, setRubrics]       = useState<Rubric[]>([]);
  const [selectedRubricId, setSelectedRubricId] = useState<number | null>(null);
  const [rubricText, setRubricText] = useState<string>("");
  const [loading, setLoading]       = useState(true);
  const [gradingIds, setGradingIds] = useState<Set<number>>(new Set());
  const [viewing, setViewing]       = useState<ViewingEssay | null>(null);
  const [error, setError]           = useState("");
  const uploadRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [essayRes, rubricRes] = await Promise.all([
        fetch("/api/essays", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/rubrics", { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      setEssays(await essayRes.json());
      setRubrics(await rubricRes.json());
    } catch {
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleRubricSelect(id: number) {
    setSelectedRubricId(id);
    setRubricText("");
    if (!id) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/rubrics/${id}/extract`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRubricText(data.text);
      }
    } catch {
      setError("Failed to extract rubric text");
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const token = localStorage.getItem("token");
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "essay");
      formData.append("name", file.name.replace(/\.[^/.]+$/, ""));
      await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
    }
    e.target.value = "";
    await loadData();
  }

  async function handleGrade(id: number) {
    setGradingIds((prev) => new Set(prev).add(id));
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/essays/${id}/grade`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rubricText: rubricText || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Grading failed");
      } else {
        await loadData();
      }
    } catch {
      setError("Grading failed");
    } finally {
      setGradingIds((prev) => { const s = new Set(prev); s.delete(id); return s; });
    }
  }

  async function handleGradeAll() {
    const ungraded = essays.filter((e) => !e.gradingResult);
    for (const essay of ungraded) {
      await handleGrade(essay.id);
    }
  }

  function handleDownload() {
    const rows = ["Name,Score,Grammar,Structure,Clarity",
      ...essays.map((e) =>
        `${e.title},${e.gradingResult?.overallScore ?? "N/A"},${e.gradingResult?.grammarScore ?? "N/A"},${e.gradingResult?.structureScore ?? "N/A"},${e.gradingResult?.clarityScore ?? "N/A"}`
      )
    ];
    const blob = new Blob([rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "grades.csv";
    a.click();
  }

  const ungradedCount = essays.filter((e) => !e.gradingResult).length;

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14, flex: 1, minHeight: 0 }}>
      {viewing && <EssayModal viewing={viewing} onClose={() => setViewing(null)} />}

      <TitleCard title="Essay Grader" />

      {error && <p style={{ color: "var(--red)", fontSize: 13 }}>{error}</p>}

      {/* Rubric selector */}
      <div className="content-card" style={{ padding: "14px 16px" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Rubric (optional)
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <select
            className="ee-input"
            style={{ flex: 1, minWidth: 200 }}
            value={selectedRubricId ?? ""}
            onChange={(e) => handleRubricSelect(Number(e.target.value))}
          >
            <option value="">No rubric — use default criteria</option>
            {rubrics.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
          {rubricText && (
            <span style={{ fontSize: 12, color: "#1a7a3f" }}>✓ Rubric loaded</span>
          )}
        </div>
      </div>

      <div className="content-card grader-card">
        {/* Actions */}
        <div className="grader-actions">
          <button className="btn-blue" onClick={() => uploadRef.current?.click()}>
            <UploadIcon /> Upload Essays
          </button>
          <button
            className="btn-blue"
            onClick={handleGradeAll}
            disabled={ungradedCount === 0 || gradingIds.size > 0}
          >
            {gradingIds.size > 0 ? `Grading ${gradingIds.size}…` : `Grade All (${ungradedCount})`}
          </button>
          <button className="btn-blue" onClick={handleDownload}>
            <DownloadIcon /> Download CSV
          </button>
          <input
            type="file"
            ref={uploadRef}
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleUpload}
            style={{ display: "none" }}
          />
        </div>

        {/* Essay list */}
        <div className="grader-list">
          <div className="grader-list-scroll">
            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                Loading essays…
              </div>
            )}
            {!loading && essays.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
                No essays yet. Upload some to get started.
              </div>
            )}
            {essays.map((e) => (
              <div key={e.id} className="essay-row">
                <div
                  className="essay-name-pill"
                  style={{ cursor: "pointer", textDecoration: e.gradingResult ? "underline" : "none" }}
                  onClick={() => setViewing({ essay: e })}
                >
                  {e.title}
                </div>

                {!e.gradingResult ? (
                  <button
                    className="btn-blue"
                    style={{ padding: "5px 12px", fontSize: 12 }}
                    onClick={() => handleGrade(e.id)}
                    disabled={gradingIds.has(e.id)}
                  >
                    {gradingIds.has(e.id) ? "Grading…" : "Grade"}
                  </button>
                ) : (
                  <button
                    className="essay-edit-btn"
                    style={{ fontSize: 12 }}
                    onClick={() => setViewing({ essay: e })}
                  >
                    View
                  </button>
                )}

                <div className="essay-score-badge" style={{ color: scoreColor(e.gradingResult?.overallScore ?? null) }}>
                  {e.gradingResult ? `${e.gradingResult.overallScore}%` : "??%"}
                </div>
              </div>
            ))}
          </div>

          <div className="drop-zone" onClick={() => uploadRef.current?.click()}>
            <UploadIcon /> Upload or Drag essays here
          </div>
        </div>
      </div>
    </div>
  );
}