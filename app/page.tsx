"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, saveUser } from "@/lib/auth";

type View = "login" | "forgot" | "reset-done";

export default function LoginPage() {
  const router = useRouter();

  const [view, setView]         = useState<View>("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setReset]  = useState("");
  const [error, setError]       = useState("");

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (getUser()) router.replace("/dashboard/checker");
  }, [router]);

  function handleSignIn() {
    if (!email || !password) { setError("Please fill in both fields."); return; }
    saveUser({ name: "John WADS", email });
    router.push("/dashboard/checker");
  }

  function handleReset() {
    if (!resetEmail) return;
    setView("reset-done");
  }

  return (
    <div className="auth-bg fade-up">
      <div className="auth-card">
        <h1 className="auth-logo">EasyEssays</h1>
        <div className="auth-divider" />

        {/* ── Sign In ── */}
        {view === "login" && (
          <>
            {error && <p className="auth-error">{error}</p>}

            <div className="auth-field">
              <label className="auth-label">Email</label>
              <input
                className="ee-input"
                type="email"
                placeholder="Value"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
              />
            </div>

            <div className="auth-field-last">
              <label className="auth-label">Password</label>
              <input
                className="ee-input"
                type="password"
                placeholder="Value"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSignIn()}
              />
            </div>

            <button className="btn-dark" onClick={handleSignIn}>Sign In</button>

            <div className="auth-center">
              <span className="auth-link" onClick={() => setView("forgot")}>
                Forgot password?
              </span>
            </div>
          </>
        )}

        {/* ── Forgot password ── */}
        {view === "forgot" && (
          <>
            <div className="auth-field-last">
              <label className="auth-label">Email</label>
              <input
                className="ee-input"
                type="email"
                placeholder="Value"
                value={resetEmail}
                onChange={(e) => setReset(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="auth-cancel" onClick={() => setView("login")}>Cancel</button>
              <button className="btn-dark" style={{ flex: 2 }} onClick={handleReset}>
                Reset Password
              </button>
            </div>
          </>
        )}

        {/* ── Reset sent ── */}
        {view === "reset-done" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>✅</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>Reset link sent!</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>
              Check your inbox at {resetEmail}
            </p>
            <button
              className="btn-dark"
              onClick={() => { setView("login"); setReset(""); }}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
