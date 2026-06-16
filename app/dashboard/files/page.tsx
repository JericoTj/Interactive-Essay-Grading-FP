"use client";

import { useState, useEffect } from "react";
import TitleCard from "@/components/TitleCard";
import { UploadIcon } from "@/components/icons";

type FileType = "Essay" | "Rubric";

interface ApiFile {
  id: number;
  name: string;
  fileName: string | null;
  fileUrl: string | null;
  type: FileType;
  createdAt: string;
}

interface ViewingFile {
  id: number;
  name: string;
  type: FileType;
  fileUrl: string | null;
}

function FileModal({ file, onClose }: { file: ViewingFile; onClose: () => void }) {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const endpoint = file.type === "Essay"
      ? `/api/essays/${file.id}/content`
      : `/api/rubrics/${file.id}/extract`;

    fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setContent(d.content ?? d.text ?? "No content available."))
      .catch(() => setContent("Failed to load content."))
      .finally(() => setLoading(false));
  }, [file]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{file.name}</h2>
          <button className="essay-edit-btn" onClick={onClose}>✕ Close</button>
        </div>
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          <div className="modal-section-label">{file.type} Content</div>
          {loading
            ? <p style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading content…</p>
            : <p className="modal-essay-text">{content}</p>
          }
        </div>
      </div>
    </div>
  );
}

export default function FilesPage() {
  const [files, setFiles]   = useState<ApiFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError]   = useState("");
  const [viewingFile, setViewingFile] = useState<ViewingFile | null>(null);

  useEffect(() => { loadFiles(); }, []);

  async function loadFiles() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const [essayRes, rubricRes] = await Promise.all([
        fetch("/api/essays", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/rubrics", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const essays  = await essayRes.json();
      const rubrics = await rubricRes.json();

      const mapped: ApiFile[] = [
        ...essays.map((e: any) => ({
          id: e.id,
          name: e.title,
          fileName: e.fileName,
          fileUrl: e.fileUrl,
          type: "Essay" as FileType,
          createdAt: e.createdAt,
        })),
        ...rubrics.map((r: any) => ({
          id: r.id,
          name: r.name,
          fileName: r.fileName,
          fileUrl: r.fileUrl,
          type: "Rubric" as FileType,
          createdAt: r.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setFiles(mapped);
    } catch {
      setError("Failed to load files");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, type: FileType) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type.toLowerCase());
      formData.append("name", file.name.replace(/\.[^/.]+$/, ""));

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        setError(err.error || "Upload failed");
        return;
      }

      await loadFiles();
    } catch {
      setError("Upload failed, please try again");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: number, type: FileType) {
    const token = localStorage.getItem("token");
    const endpoint = type === "Essay" ? `/api/essays/${id}` : `/api/rubrics/${id}`;
    await fetch(endpoint, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setFiles((prev) => prev.filter((f) => !(f.id === id && f.type === type)));
  }

  return (
  <div className="fade-up" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    {viewingFile && <FileModal file={viewingFile} onClose={() => setViewingFile(null)} />}
      <TitleCard title="Files" />
      <div className="content-card">
        {error && <p style={{ color: "var(--red)", fontSize: 13, marginBottom: 10 }}>{error}</p>}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
          <label className="btn-blue" style={{ cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
            <UploadIcon /> {uploading ? "Uploading…" : "Upload Essay"}
            <input type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={(e) => handleUpload(e, "Essay")} disabled={uploading} />
          </label>
          <label className="btn-blue" style={{ cursor: uploading ? "not-allowed" : "pointer", opacity: uploading ? 0.6 : 1 }}>
            <UploadIcon /> {uploading ? "Uploading…" : "Upload Rubric"}
            <input type="file" accept=".pdf,.docx,.txt" style={{ display: "none" }} onChange={(e) => handleUpload(e, "Rubric")} disabled={uploading} />
          </label>
        </div>

        <div className="files-header">
          <span>Name</span>
          <span>Type</span>
          <span>Date</span>
          <span>Action</span>
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            Loading files…
          </div>
        )}

        {!loading && files.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "var(--text-muted)" }}>
            No files yet. Upload an essay or rubric to get started.
          </div>
        )}

        {files.map((f) => (
          <div key={`${f.type}-${f.id}`} className="files-row">
            <span style={{ fontWeight: 600, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {f.name}
            </span>
            <span>
              <span style={{
                background: f.type === "Rubric" ? "#D4E4FF" : "#D4F0DD",
                color: f.type === "Rubric" ? "#2D4A8A" : "#1a7a3f",
                borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600,
              }}>
                {f.type}
              </span>
            </span>
            <span style={{ color: "var(--text-muted)", fontSize: 12 }}>
              {new Date(f.createdAt).toLocaleDateString()}
            </span>
            <div style={{ display: "flex", gap: 6 }}>
              {f.fileUrl && (
                <a
                  href={f.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="essay-edit-btn"
                  style={{ fontSize: 12 }}
                >
                  Open
                </a>
              )}
              <button
                className="essay-edit-btn"
                style={{ fontSize: 12 }}
                onClick={() => setViewingFile({ id: f.id, name: f.name, type: f.type, fileUrl: f.fileUrl })}
              >
                Open
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
