import { useState, useEffect } from "react";
import { Page, VideoItem } from "./types";
import Header from "./components/Header";
import HomeView from "./views/HomeView";
import WatchView from "./views/WatchView";
import ToolsView from "./views/ToolsView";
import PublicWatchView from "./views/PublicWatchView";
import AddUrlModal from "./components/AddUrlModal";

function genShareId(): string {
  return Math.random().toString(36).slice(2, 7) + Math.random().toString(36).slice(2, 7);
}

function getShareUrl(shareId: string): string {
  return `${window.location.origin}${window.location.pathname}?v=${shareId}`;
}


const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: "vid-pta-1",
    shareId: "pta9x2r7kw",
    url: "https://playmogo.com/e/qyfyr7x4t0af",
    type: "embed",
    label: "Embed Video",
    source: "playmogo.com",
    title: "Pretty talented actress",
    extractedFrom: "https://playmogo.com/e/qyfyr7x4t0af",
    extractedAt: Date.now(),
    views: 0,
    thumbnail: "https://ticdn.net/splash/98vkekjaqkhvz17g.jpg",
  },
];

export default function App() {
  const [publicMode, setPublicMode] = useState(false);
  const [publicShareId, setPublicShareId] = useState<string | null>(null);
  const [page, setPage] = useState<Page>("home");
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"new" | "az">("new");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vParam = params.get("v");
    if (vParam) {
      setPublicMode(true);
      setPublicShareId(vParam);
    }

    const saved = localStorage.getItem("vidtube_v3_library");
    if (saved) {
      try {
        const parsed: VideoItem[] = JSON.parse(saved);
        const withShareIds = parsed.map((v) => ({
          ...v,
          shareId: v.shareId || genShareId(),
        }));
        setAllVideos(withShareIds.length > 0 ? withShareIds : INITIAL_VIDEOS);
      } catch {
        localStorage.removeItem("vidtube_v3_library");
        setAllVideos(INITIAL_VIDEOS);
      }
    } else {
      setAllVideos(INITIAL_VIDEOS);
    }
  }, []);

  useEffect(() => {
    if (!publicMode && allVideos.length > 0) {
      localStorage.setItem("vidtube_v3_library", JSON.stringify(allVideos.slice(0, 300)));
    }
  }, [allVideos, publicMode]);

  const handleExtract = async (url: string, mode: "fast" | "deep" = "fast") => {
    setExtractLoading(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newVideos: VideoItem[] = (data.results || []).map((r: any) => ({
        id: Math.random().toString(36).slice(2),
        shareId: genShareId(),
        url: r.url,
        type: r.type?.toLowerCase() || "video",
        label: r.label,
        source: r.source,
        title: r.url.split("/").pop()?.split("?")[0]?.replace(/[-_]/g, " ").replace(/\.[^.]+$/, "") || "Video",
        pageTitle: data.pageTitle,
        extractedFrom: url,
        extractedAt: Date.now(),
        views: Math.floor(Math.random() * 900000) + 1000,
      }));

      if (newVideos.length === 0) {
        setExtractError("No videos found. Try switching to Deep mode for JavaScript-heavy sites.");
        return;
      }

      const existingUrls = new Set(allVideos.map((v) => v.url));
      const fresh = newVideos.filter((v) => !existingUrls.has(v.url));
      setAllVideos((prev) => [...fresh, ...prev]);
      setExtractError(null);
      setShowAddModal(false);
    } catch (e: any) {
      setExtractError(e.message || "Extraction failed.");
    } finally {
      setExtractLoading(false);
    }
  };

  const handleWatch = (video: VideoItem) => {
    setCurrentVideo(video);
    setPage("watch");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setAllVideos((prev) =>
      prev.map((v) => (v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v))
    );
  };

  const handleSearch = (query: string) => {
    if (query.startsWith("http")) {
      handleExtract(query);
    }
  };

  if (publicMode) {
    const video = allVideos.find((v) => v.shareId === publicShareId)
      || SAMPLE_VIDEOS.find((v) => v.shareId === publicShareId)
      || null;
    const shareUrl = publicShareId ? getShareUrl(publicShareId) : "";
    return <PublicWatchView video={video} shareUrl={shareUrl} />;
  }

  const categories = ["all", ...Array.from(new Set(allVideos.map((v) => v.type).filter(Boolean)))];
  const displayVideos = allVideos
    .filter((v) => activeCategory === "all" || v.type === activeCategory)
    .sort((a, b) => sortBy === "new" ? b.extractedAt - a.extractedAt : a.title.localeCompare(b.title));

  return (
    <div className="min-h-screen" style={{ background: "#141414", color: "#e0e0e0" }}>
      <Header
        onSearch={handleSearch}
        onAddUrl={() => setShowAddModal(true)}
        onHome={() => setPage("home")}
        onTools={() => setPage("tools")}
      />

      {page === "home" && (
        <HomeView
          videos={displayVideos}
          allVideos={allVideos}
          categories={categories}
          activeCategory={activeCategory}
          sortBy={sortBy}
          onCategoryChange={setActiveCategory}
          onSortChange={setSortBy}
          onWatch={handleWatch}
          onAddUrl={() => setShowAddModal(true)}
          getShareUrl={(v) => getShareUrl(v.shareId)}
        />
      )}
      {page === "watch" && currentVideo && (
        <WatchView
          video={currentVideo}
          relatedVideos={allVideos.filter((v) => v.id !== currentVideo.id)}
          onWatch={handleWatch}
          onBack={() => setPage("home")}
          shareUrl={getShareUrl(currentVideo.shareId)}
        />
      )}
      {page === "tools" && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <ToolsView />
        </div>
      )}

      {showAddModal && (
        <AddUrlModal
          onClose={() => { setShowAddModal(false); setExtractError(null); }}
          onExtract={handleExtract}
          loading={extractLoading}
          error={extractError}
        />
      )}
    </div>
  );
}
