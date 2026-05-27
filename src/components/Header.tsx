import { useState } from "react";
import { Search, Menu, Play, X } from "lucide-react";
import { Page } from "../types";

interface HeaderProps {
  onNavigate: (page: Page, url?: string) => void;
  onToggleSidebar: () => void;
  onSearch: (url: string) => void;
}

export default function Header({ onNavigate, onToggleSidebar, onSearch }: HeaderProps) {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
    setQuery("");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0f0f0f] border-b border-white/5 flex items-center px-4 gap-4">
      <div className="flex items-center gap-4 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
        >
          <Menu size={20} className="text-white" />
        </button>
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Play size={16} className="text-white fill-white ml-0.5" />
          </div>
          <span className="text-white font-bold text-lg tracking-tight hidden sm:block">
            Vid<span className="text-red-500">Tube</span>
          </span>
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-auto flex">
        <div className="flex-1 flex items-center bg-[#121212] border border-white/10 rounded-l-full overflow-hidden focus-within:border-blue-500 transition-colors">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Paste a URL to extract videos..."
            className="flex-1 bg-transparent text-white text-sm px-5 py-2.5 outline-none placeholder:text-zinc-500"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} className="pr-3 text-zinc-500 hover:text-white">
              <X size={16} />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-5 bg-zinc-800 hover:bg-zinc-700 border border-l-0 border-white/10 rounded-r-full flex items-center gap-2 text-zinc-300 hover:text-white transition-colors"
        >
          <Search size={18} />
        </button>
      </form>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onNavigate("tools")}
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-full text-white text-sm font-medium transition-colors"
        >
          Tools
        </button>
      </div>
    </header>
  );
}
