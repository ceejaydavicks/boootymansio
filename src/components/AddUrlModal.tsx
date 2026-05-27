import { useState, useEffect } from "react";
import { X, Globe, Zap, Search, AlertCircle, Loader2 } from "lucide-react";

interface AddUrlModalProps {
  onClose: () => void;
  onExtract: (url: string, mode: "fast" | "deep") => void;
  loading: boolean;
  error: string | null;
}

export default function AddUrlModal({ onClose, onExtract, loading, error }: AddUrlModalProps) {
  const [url, setUrl] = useState("");
  const [mode, setMode] = useState<"fast" | "deep">("fast");

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) onExtract(url.trim(), mode);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-lg overflow-hidden"
        style={{ background: "#1e1e1e", border: "1px solid #333" }}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid #2a2a2a" }}>
          <h2 className="text-white font-bold text-base">Add Videos from URL</h2>
          <button onClick={onClose} className="text-[#666] hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#888" }}>
              Webpage URL
            </label>
            <div
              className="flex items-center"
              style={{ background: "#0d0d0d", border: "1px solid #333", borderRadius: 6, overflow: "hidden" }}
            >
              <Globe size={15} className="ml-3 flex-shrink-0" style={{ color: "#555" }} />
              <input
                autoFocus
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/videos"
                className="flex-1 bg-transparent py-3 px-3 text-sm outline-none placeholder-[#444] font-mono"
                style={{ color: "#e0e0e0" }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider mb-2 block" style={{ color: "#888" }}>
              Extraction Mode
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([
                { id: "fast", label: "Fast", desc: "Static HTML parsing", icon: Zap },
                { id: "deep", label: "Deep", desc: "JavaScript browser render (~60s)", icon: Globe },
              ] as const).map(({ id, label, desc, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  className="flex items-start gap-3 p-3 rounded-lg text-left transition-all"
                  style={{
                    background: mode === id ? "rgba(255,51,0,0.15)" : "#141414",
                    border: `1px solid ${mode === id ? "#f30" : "#2a2a2a"}`,
                  }}
                >
                  <Icon size={16} style={{ color: mode === id ? "#f30" : "#666", marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div className="text-sm font-semibold" style={{ color: mode === id ? "#fff" : "#aaa" }}>{label}</div>
                    <div className="text-[11px] mt-0.5" style={{ color: "#666" }}>{desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div
              className="flex items-start gap-2 p-3 rounded text-sm"
              style={{ background: "rgba(255,50,50,0.1)", border: "1px solid rgba(255,50,50,0.25)", color: "#f77" }}
            >
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="w-full py-3 rounded font-bold text-sm flex items-center justify-center gap-2 transition-opacity disabled:opacity-50"
            style={{ background: "#f30", color: "#fff" }}
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" /> Extracting videos...</>
            ) : (
              <><Search size={16} /> Extract Videos</>
            )}
          </button>

          <p className="text-[11px] text-center" style={{ color: "#555" }}>
            VidTube will scan the page for embedded MP4, M3U8, WebM and other video streams.
          </p>
        </form>
      </div>
    </div>
  );
}
