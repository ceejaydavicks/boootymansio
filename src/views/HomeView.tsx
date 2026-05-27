import { Film, Plus, TrendingUp } from "lucide-react";
import { VideoItem } from "../types";
import VideoCard from "../components/VideoCard";

interface HomeViewProps {
  videos: VideoItem[];
  allVideos: VideoItem[];
  categories: string[];
  activeCategory: string;
  sortBy: "new" | "az";
  onCategoryChange: (cat: string) => void;
  onSortChange: (s: "new" | "az") => void;
  onWatch: (video: VideoItem) => void;
  onAddUrl: () => void;
}

export default function HomeView({
  videos, allVideos, categories, activeCategory, sortBy,
  onCategoryChange, onSortChange, onWatch, onAddUrl,
}: HomeViewProps) {
  return (
    <main className="max-w-[1600px] mx-auto px-4 py-4">
      {allVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
          >
            <Film size={40} style={{ color: "#333" }} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">No videos yet</h2>
            <p className="text-sm max-w-sm" style={{ color: "#888" }}>
              Add a webpage URL and we'll extract all embedded videos for you to watch instantly.
            </p>
          </div>
          <button
            onClick={onAddUrl}
            className="flex items-center gap-2 px-6 py-3 rounded font-bold text-sm transition-opacity hover:opacity-90"
            style={{ background: "#f30", color: "#fff" }}
          >
            <Plus size={18} /> Add Videos from URL
          </button>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
            {[
              { title: "Paste any URL", desc: "Works on news sites, blogs, sports streams, and more" },
              { title: "Instant extraction", desc: "Videos appear in seconds using fast HTML parsing" },
              { title: "Watch in browser", desc: "Play MP4, M3U8, WebM and more without downloading" },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="p-4 rounded-lg text-center"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <div className="font-semibold text-sm text-white mb-1">{title}</div>
                <div className="text-xs" style={{ color: "#666" }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <div
              className="flex items-center overflow-x-auto scrollbar-none gap-1 flex-1"
              style={{ minWidth: 0 }}
            >
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className="px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wide whitespace-nowrap flex-shrink-0 transition-colors"
                  style={{
                    background: activeCategory === cat ? "#f30" : "#1e1e1e",
                    color: activeCategory === cat ? "#fff" : "#888",
                    border: `1px solid ${activeCategory === cat ? "#f30" : "#2a2a2a"}`,
                  }}
                >
                  {cat === "all" ? "All Videos" : cat.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <span className="text-xs mr-1" style={{ color: "#666" }}>Sort:</span>
              {(["new", "az"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onSortChange(s)}
                  className="px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                  style={{
                    background: sortBy === s ? "#252525" : "transparent",
                    color: sortBy === s ? "#fff" : "#666",
                    border: `1px solid ${sortBy === s ? "#333" : "transparent"}`,
                  }}
                >
                  {s === "new" ? "Newest" : "A-Z"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={14} style={{ color: "#f30" }} />
            <span className="text-sm font-semibold text-white">{videos.length} video{videos.length !== 1 ? "s" : ""}</span>
            {activeCategory !== "all" && (
              <span className="text-xs uppercase font-bold px-2 py-0.5 rounded" style={{ background: "#f30", color: "#fff" }}>
                {activeCategory}
              </span>
            )}
          </div>

          <div className="grid gap-5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} onWatch={onWatch} />
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <button
              onClick={onAddUrl}
              className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "#1e1e1e", border: "1px solid #333", color: "#aaa" }}
            >
              <Plus size={15} /> Add more videos
            </button>
          </div>
        </>
      )}
    </main>
  );
}
