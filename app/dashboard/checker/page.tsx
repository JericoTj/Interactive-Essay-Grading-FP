"use client";

import { useState, useRef } from "react";
import TitleCard from "@/components/TitleCard";
import { UploadIcon } from "@/components/icons";
import type { GradeResult, Criterion } from "@/lib/types";

type View = "input" | "summary" | "detail";

function scoreColor(score: number) {
  if (score >= 85) return "var(--green)";
  if (score >= 70) return "var(--orange)";
  return "var(--red)";
}

function CriterionRow({ c }: { c: Criterion }) {
  return (
    <div className="criterion">
      <div className="criterion-header">
        <span>{c.name}</span>
        <span style={{ color: scoreColor(c.score) }}>{c.score}/{c.max}</span>
      </div>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${(c.score / c.max) * 100}%`, background: scoreColor(c.score) }}
        />
      </div>
      <div className="criterion-feedback">{c.feedback}</div>
    </div>
  );
}
function InputView({ onResult }: { onResult: (r: GradeResult, essayId: number) => void }) {
  const [title, setTitle]       = useState("");
  const [text, setText]         = useState("");
  const [error, setError]       = useState("");
  const [checking, setChecking] = useState(false);

  async function handleCheck() {
    if (!title.trim() || !text.trim()) {
      setError("Please enter a title and essay text.");
      return;
    }
    setError("");
    setChecking(true);

    try {
      const token = localStorage.getItem("token");

      const essayRes = await fetch("/api/essays", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content: text }),
      });

      if (!essayRes.ok) {
        const e = await essayRes.json();
        setError(e.error || "Failed to submit essay");
        return;
      }

      const essay = await essayRes.json();

      const gradeRes = await fetch(`/api/essays/${essay.id}/grade`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!gradeRes.ok) {
        const e = await gradeRes.json();
        setError(e.error || "Grading failed");
        return;
      }

      const grading = await gradeRes.json();

      const result: GradeResult = {
        aiScore: 0,
        grade: grading.overallScore,
        letter: grading.overallScore >= 90 ? "A" : grading.overallScore >= 80 ? "B" : grading.overallScore >= 70 ? "C" : "D",
        summary: grading.overallFeedback,
        criteria: [
          { name: "Grammar",   score: grading.grammarScore,   max: 100, feedback: grading.grammarFeedback },
          { name: "Structure", score: grading.structureScore, max: 100, feedback: grading.structureFeedback },
          { name: "Clarity",   score: grading.clarityScore,   max: 100, feedback: grading.clarityFeedback },
        ],
      };

      onResult(result, essay.id);
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="checker-wrap fade-up">
      <TitleCard title="Essay Checker" />
      <div className="content-card checker-card">
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 8 }}>{error}</p>}

        <input
          className="ee-input"
          placeholder="Essay title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 10 }}
        />

        <div className="essay-area" onClick={() => document.getElementById("essay-ta")?.focus()}>
          {!text && (
            <div className="essay-placeholder">
              <UploadIcon size={20} />
              Paste your essay here
            </div>
          )}
          <textarea
            id="essay-ta"
            className="essay-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="checker-actions">
          <button className="btn-blue" onClick={handleCheck} disabled={!text.trim() || checking}>
            {checking ? "Grading…" : "Check"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryView({
  result,
  essayId,
  onNext,
}: {
  result: GradeResult;
  essayId: number;
  onNext: () => void;
}) {
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    // Essay is already saved in DB — just confirm to user
    setSaved(true);
  }

  return (
    <div className="checker-wrap fade-up">
      <TitleCard title="Summary" />
      <div className="summary-layout" style={{ flex: 1, minHeight: 0 }}>
        <div className="content-card summary-left">
          <p className="summary-text">{result.summary}</p>
          {result.criteria.map((c, i) => <CriterionRow key={i} c={c} />)}
        </div>
        <div className="content-card summary-right">
          <div>
            <div style={{ marginBottom: 28 }}>
              <div className="score-label">Grades &nbsp;{result.grade}%</div>
              <div className="score-letter">{result.letter}</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
              Essay ID: #{essayId}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button
              className="btn-blue"
              style={{ justifyContent: "center", width: "100%" }}
              onClick={handleSave}
              disabled={saved}
            >
              {saved ? "✓ Saved to Files" : "Save Essay"}
            </button>
            <button
              className="btn-blue"
              style={{ justifyContent: "center", width: "100%" }}
              onClick={onNext}
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailView({ result, onBack }: { result: GradeResult; onBack: () => void }) {
  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <TitleCard title="Detailed Report" />
        <button className="btn-blue" onClick={onBack}>← Back</button>
      </div>
      <div className="content-card">
        {result.criteria.map((c, i) => (
          <div key={i} style={{ marginBottom: 22, paddingBottom: 22, borderBottom: i < result.criteria.length - 1 ? "1px solid var(--border)" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: scoreColor(c.score) }}>{c.score}/{c.max}</span>
            </div>
            <div className="score-bar-track" style={{ height: 7, marginBottom: 8 }}>
              <div className="score-bar-fill" style={{ width: `${(c.score / c.max) * 100}%`, background: scoreColor(c.score) }} />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, fontStyle: "italic" }}>{c.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default function CheckerPage() {
  const [view, setView]       = useState<View>("input");
  const [result, setResult]   = useState<GradeResult | null>(null);
  const [essayId, setEssayId] = useState<number>(0);

  function handleResult(r: GradeResult, id: number) {
    setResult(r);
    setEssayId(id);
    setView("summary");
  }

  return (
    <>
      {view === "input"   && <InputView onResult={handleResult} />}
      {view === "summary" && result && (
        <SummaryView result={result} essayId={essayId} onNext={() => setView("detail")} />
      )}
      {view === "detail"  && result && (
        <DetailView result={result} onBack={() => setView("summary")} />
      )}
    </>
  );
}