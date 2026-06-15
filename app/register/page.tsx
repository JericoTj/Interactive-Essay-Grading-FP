"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveUser } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState<"STUDENT" | "INSTRUCTOR">("STUDENT");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  async function handleRegister() {
    if (!name || !email || !password) { setError("All fields are required."); return; }
    setLoading(true);
    setError("");

    try {
      // Register
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); setLoading(false); return; }

      // Auto login
      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json();
      if (!loginRes.ok) { router.push("/"); return; }

      saveUser(loginData.token);
      router.push("/dashboard/checker");
    } catch {
      setError("Something went wrong, please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-bg fade-up">
      <div className="auth-card">
        <h1 className="auth-logo">EasyEssays</h1>
        <div className="auth-divider" />

        {error && <p className="auth-error">{error}</p>}

        <div className="auth-field">
          <label className="auth-label">Name</label>
          <input className="ee-input" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="auth-field">
          <label className="auth-label">Email</label>
          <input className="ee-input" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="auth-field">
          <label className="auth-label">Password</label>
          <input className="ee-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div className="auth-field-last">
          <label className="auth-label">Role</label>
          <select className="ee-input" value={role} onChange={(e) => setRole(e.target.value as "STUDENT" | "INSTRUCTOR")}>
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>
        </div>

        <button className="btn-dark" onClick={handleRegister} disabled={loading}>
          {loading ? "Creating account…" : "Register"}
        </button>

        <div className="auth-center">
          <span className="auth-link" onClick={() => router.push("/")}>Already have an account? Sign in</span>
        </div>
      </div>
    </div>
  );
}