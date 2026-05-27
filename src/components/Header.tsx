import { useState } from "react";
import { Search, Plus, Wrench, X } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  onAddUrl: () => void;
  onHome: () => void;
  onTools: () => void;
}

export default function Header({ onSearch, onAddUrl, onHome, onTools }: HeaderProps) {
  const [q, setQ] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) { onSearch(q.trim()); setQ(""); }
  };

  return (
    <header style={{ background: "#1a1a1a", borderBottom: "1px solid #2a2a2a" }} className="sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center gap-4">
        <button onClick={onHome} className="flex items-center gap-1.5 flex-shrink-0 select-none">
          <span
            className="text-white font-black text-xl tracking-tight"
            style={{ background: "#f30", padding: "2px 7px", borderRadius: 4 }}
          >
            X
          </span>
          <span className="text-white font-bold text-lg tracking-tight hidden sm:inline">
            VIDEOS
          </span>
        </button>

        <form onSubmit={submit} className="flex-1 max-w-2xl flex">
          <div
            className="flex-1 flex items-center"
            style={{ background: "#0d0d0d", border: "1px solid #333", borderRadius: "4px 0 0 4px", overflow: "hidden" }}
          >
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search videos or paste a URL to extract..."
              className="flex-1 bg-transparent text-sm py-2.5 px-4 outline-none placeholder-[#555]"
              style={{ color: "#e0e0e0" }}
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="pr-3 text-[#555] hover:text-[#aaa]">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="submit"
            className="px-5 flex items-center justify-center transition-colors"
            style={{ background: "#f30", borderRadius: "0 4px 4px 0" }}
          >
            <Search size={16} className="text-white" />
          </button>
        </form>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onAddUrl}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded transition-colors"
            style={{ background: "#f30", color: "#fff" }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Add Videos</span>
          </button>
          <button
            onClick={onTools}
            title="Tools"
            className="w-9 h-9 flex items-center justify-center rounded transition-colors hover:bg-white/10"
            style={{ color: "#aaa" }}
          >
            <Wrench size={16} />
          </button>
        </div>
      </div>

      <nav style={{ background: "#111", borderTop: "1px solid #222" }}>
        <div className="max-w-[1600px] mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-none h-9">
          {["Videos", "HD", "New", "Popular", "Categories", "Upload"].map((item) => (
            <button
              key={item}
              onClick={item === "Upload" ? onAddUrl : undefined}
              className="px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors hover:text-white flex-shrink-0"
              style={{ color: "#888" }}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
