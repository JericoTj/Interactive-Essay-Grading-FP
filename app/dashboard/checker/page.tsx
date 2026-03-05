"use client";

import { useState, useRef } from "react";
import TitleCard from "@/components/TitleCard";
import { UploadIcon } from "@/components/icons";
import { MOCK_RESULT } from "@/lib/mock-data";
import type { GradeResult, Criterion } from "@/lib/types";

type View = "input" | "summary" | "detail";

/* ── helpers ─────────────────────────────────────────────────────────────── */
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

/* ── Input view ──────────────────────────────────────────────────────────── */
function InputView({ onResult }: { onResult: (r: GradeResult) => void }) {
  const [text, setText]         = useState("");
  const [rubric, setRubric]     = useState<File | null>(null);
  const [checking, setChecking] = useState(false);
  const rubricRef = useRef<HTMLInputElement>(null);

  function handleCheck() {
    if (!text.trim()) return;
    setChecking(true);
    setTimeout(() => { setChecking(false); onResult(MOCK_RESULT); }, 3000);
  }

  return (
    <div className="checker-wrap fade-up">
      <TitleCard title="Essay Checker" />

      <div className="content-card checker-card">
        {/* Text area */}
        <div
          className="essay-area"
          onClick={() => document.getElementById("essay-ta")?.focus()}
        >
          {!text && (
            <div className="essay-placeholder">
              <UploadIcon size={20} />
              Upload or Paste Text here
            </div>
          )}
          <textarea
            id="essay-ta"
            className="essay-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="checker-actions">
          <button className="btn-blue" onClick={handleCheck} disabled={!text.trim() || checking}>
            {checking ? "Checking…" : "Check"}
          </button>

          <input
            type="file"
            ref={rubricRef}
            accept=".pdf,.docx,.txt"
            onChange={(e) => setRubric(e.target.files?.[0] ?? null)}
            style={{ display: "none" }}
          />
          <button className="btn-blue" onClick={() => rubricRef.current?.click()}>
            <UploadIcon />
            {rubric ? rubric.name.slice(0, 16) + "…" : "Rubric"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Summary view ────────────────────────────────────────────────────────── */
function SummaryView({
  result,
  onNext,
}: {
  result: GradeResult;
  onNext: () => void;
}) {
  return (
    <div className="checker-wrap fade-up">
      <TitleCard title="Summary" />

      <div className="summary-layout" style={{ flex: 1, minHeight: 0 }}>
        {/* Left */}
        <div className="content-card summary-left">
          <p className="summary-text">{result.summary}</p>
          {result.criteria.map((c, i) => <CriterionRow key={i} c={c} />)}
        </div>

        {/* Right – matches Figma image3 exactly */}
        <div className="content-card summary-right">
          <div>
            <div style={{ marginBottom: 28 }}>
              <div className="score-label">AI &nbsp;&nbsp;{result.aiScore}%</div>
            </div>
            <div>
              <div className="score-label">Grades &nbsp;{result.grade}%</div>
              <div className="score-letter">{result.letter}</div>
            </div>
          </div>
          <button className="btn-blue" style={{ justifyContent: "center", width: "100%" }} onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Detail view ─────────────────────────────────────────────────────────── */
function DetailView({ result, onBack }: { result: GradeResult; onBack: () => void }) {
  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <TitleCard title="Detailed Report" />
        <button className="btn-blue" onClick={onBack}>← Back</button>
      </div>

      <div className="content-card">
        {result.criteria.map((c, i) => (
          <div
            key={i}
            style={{
              marginBottom: 22,
              paddingBottom: 22,
              borderBottom: i < result.criteria.length - 1 ? "1px solid var(--border)" : "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: scoreColor(c.score) }}>
                {c.score}/{c.max}
              </span>
            </div>
            <div className="score-bar-track" style={{ height: 7, marginBottom: 8 }}>
              <div
                className="score-bar-fill"
                style={{ width: `${(c.score / c.max) * 100}%`, background: scoreColor(c.score) }}
              />
            </div>
            <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, fontStyle: "italic" }}>
              {c.feedback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function CheckerPage() {
  const [view, setView]     = useState<View>("input");
  const [result, setResult] = useState<GradeResult | null>(null);

  function handleResult(r: GradeResult) { setResult(r); setView("summary"); }

  return (
    <>
      {view === "input"   && <InputView onResult={handleResult} />}
      {view === "summary" && result && (
        <SummaryView result={result} onNext={() => setView("detail")} />
      )}
      {view === "detail"  && result && (
        <DetailView result={result} onBack={() => setView("summary")} />
      )}
    </>
  );
}
