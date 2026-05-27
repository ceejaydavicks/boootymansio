import { useState } from "react";
import { Search, Zap, Globe, Loader2, AlertCircle, Film, X, Filter } from "lucide-react";
import { VideoItem } from "../types";
import VideoCard from "../components/VideoCard";

interface BrowseViewProps {
  videos: VideoItem[];
  loading: boolean;
  error: string | null;
  currentPageTitle: string;
  onExtract: (url: string, mode: "fast" | "deep") => void;
  onWatch: (video: VideoItem) => void;
  initialUrl?: string;
}

export default function BrowseView({
  videos,
  loading,
  error,
  currentPageTitle,
  onExtract,
  onWatch,
  initialUrl = "",
}: BrowseViewProps) {
  const [url, setUrl] = useState(initialUrl);
  const [mode, setMode] = useState<"fast" | "deep">("fast");
  const [filter, setFilter] = useState("all");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    onExtract(url.trim(), mode);
  };

  const types = ["all", ...Array.from(new Set(videos.map((v) => v.type?.toLowerCase()).filter(Boolean)))];
  const filtered = filter === "all" ? videos : videos.filter((v) => v.type?.toLowerCase() === filter);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-white font-bold text-2xl mb-1">Browse Videos</h1>
        <p className="text-zinc-500 text-sm">Extract embedded videos from any webpage URL</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center bg-zinc-900 border border-white/10 rounded-xl px-4 focus-within:border-red-500 transition-colors">
          <Globe size={16} className="text-zinc-500 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/page-with-videos"
            className="flex-1 bg-transparent text-white text-sm py-3.5 outline-none placeholder:text-zinc-600 font-mono"
          />
          {url && (
            <button type="button" onClick={() => setUrl("")} className="ml-2 text-zinc-600 hover:text-zinc-400">
              <X size={14} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <div className="flex bg-zinc-900 border border-white/10 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => setMode("fast")}
              className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                mode === "fast" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Zap size={14} /> Fast
            </button>
            <button
              type="button"
              onClick={() => setMode("deep")}
              className={`px-4 py-2.5 text-sm font-medium flex items-center gap-1.5 transition-colors ${
                mode === "deep" ? "bg-red-600 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Globe size={14} /> Deep
            </button>
          </div>
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
            {loading ? "Extracting..." : "Extract"}
          </button>
        </div>
      </form>

      {mode === "deep" && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm">
          <Globe size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Deep mode</span> launches a headless browser to render JavaScript and intercept network streams. Takes 30–60 seconds.
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 size={40} className="animate-spin text-red-500" />
          <p className="text-zinc-400 text-sm">
            {mode === "deep" ? "Launching browser & monitoring network streams..." : "Scanning page for video assets..."}
          </p>
        </div>
      )}

      {!loading && videos.length > 0 && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-white font-semibold">
                {videos.length} video{videos.length !== 1 ? "s" : ""} found
              </h2>
              {currentPageTitle && <p className="text-zinc-500 text-sm truncate">{currentPageTitle}</p>}
            </div>
            {types.length > 2 && (
              <div className="flex items-center gap-2 flex-wrap">
                <Filter size={14} className="text-zinc-500" />
                {types.map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors uppercase ${
                      filter === t ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {filtered.map((video) => (
              <VideoCard key={video.id} video={video} onWatch={onWatch} />
            ))}
          </div>
        </>
      )}

      {!loading && !error && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center">
            <Film size={28} className="text-zinc-600" />
          </div>
          <h3 className="text-zinc-400 font-medium">No results yet</h3>
          <p className="text-zinc-600 text-sm max-w-sm">
            Enter a URL above and hit Extract. VidTube will scan the page for MP4, M3U8, WebM and other video streams.
          </p>
        </div>
      )}
    </div>
  );
}
