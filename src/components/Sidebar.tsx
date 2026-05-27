import { Home, Search, Clock, Wrench, ChevronRight } from "lucide-react";
import { Page, VideoItem } from "../types";

interface SidebarProps {
  open: boolean;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  recentVideos: VideoItem[];
  onWatch: (video: VideoItem) => void;
}

const navItems = [
  { id: "home" as Page, label: "Home", icon: Home },
  { id: "browse" as Page, label: "Browse", icon: Search },
  { id: "tools" as Page, label: "Tools", icon: Wrench },
];

export default function Sidebar({ open, currentPage, onNavigate, recentVideos, onWatch }: SidebarProps) {
  if (!open) {
    return (
      <aside className="hidden md:flex flex-col items-center w-[72px] flex-shrink-0 pt-4 gap-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center gap-1 w-16 py-3 px-1 rounded-xl transition-colors text-xs font-medium ${
              currentPage === id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon size={20} />
            <span className="text-[10px]">{label}</span>
          </button>
        ))}
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex flex-col w-60 flex-shrink-0 pt-4 gap-1 overflow-y-auto">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onNavigate(id)}
          className={`flex items-center gap-5 w-full px-4 py-2.5 rounded-xl transition-colors text-sm font-medium ${
            currentPage === id ? "bg-white/10 text-white" : "text-zinc-400 hover:bg-white/5 hover:text-white"
          }`}
        >
          <Icon size={20} className="flex-shrink-0" />
          {label}
        </button>
      ))}

      {recentVideos.length > 0 && (
        <>
          <div className="mx-4 my-2 border-t border-white/5" />
          <div className="px-4 mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Clock size={12} /> Recent
            </span>
          </div>
          {recentVideos.slice(0, 6).map((v) => {
            const filename = v.url.split("/").pop()?.split("?")[0] || "video";
            const title = v.title || filename;
            return (
              <button
                key={v.id}
                onClick={() => onWatch(v)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-white/5 rounded-xl transition-colors text-left w-full group"
              >
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-[9px] text-zinc-400 font-bold uppercase">{v.type || "?"}</span>
                </div>
                <span className="text-xs text-zinc-400 group-hover:text-white truncate flex-1 transition-colors">
                  {title}
                </span>
                <ChevronRight size={12} className="text-zinc-600 group-hover:text-zinc-400 flex-shrink-0" />
              </button>
            );
          })}
        </>
      )}
    </aside>
  );
}
