"use client";

import { useState } from "react";
import TitleCard from "@/components/TitleCard";
import { UploadIcon } from "@/components/icons";
import { MOCK_FILES } from "@/lib/mock-data";
import type { StoredFile } from "@/lib/types";

export default function FilesPage() {
  const [files, setFiles] = useState<StoredFile[]>(MOCK_FILES);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const incoming = Array.from(e.target.files ?? []).map<StoredFile>((f) => ({
      name: f.name,
      type: "Essay",
      date: new Date().toISOString().slice(0, 10),
      size: `${Math.round(f.size / 1024)} KB`,
    }));
    setFiles((prev) => [...prev, ...incoming]);
    e.target.value = "";
  }

  return (
    <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <TitleCard title="Files" />

      <div className="content-card">
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
          <label className="btn-blue" style={{ cursor: "pointer" }}>
            <UploadIcon /> Upload File
            <input type="file" multiple style={{ display: "none" }} onChange={handleUpload} />
          </label>
        </div>

        <div className="files-header">
          <span>Name</span>
          <span>Type</span>
          <span>Date</span>
          <span>Size</span>
          <span>Action</span>
        </div>

        {files.map((f, i) => (
          <div key={i} className="files-row">
            <span style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {f.name}
            </span>
            <span>
              <span
                style={{
                  background: f.type === "Rubric" ? "#D4E4FF" : "#D4F0DD",
                  color: f.type === "Rubric" ? "#2D4A8A" : "#1a7a3f",
                  borderRadius: 20,
                  padding: "3px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {f.type}
              </span>
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{f.date}</span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>{f.size}</span>
            <button
              className="essay-edit-btn"
              style={{ fontSize: 12 }}
              onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
            >
              Delete
            </button>
          </div>
        ))}

        {files.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            No files uploaded yet.
          </div>
        )}
      </div>
    </div>
  );
}
