import { useState, useEffect } from "react";
import { Page, VideoItem } from "./types";
import Header from "./components/Header";
import HomeView from "./views/HomeView";
import WatchView from "./views/WatchView";
import ToolsView from "./views/ToolsView";
import AddUrlModal from "./components/AddUrlModal";

const SAMPLE_VIDEOS: VideoItem[] = [
  {
    id: "sample-1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "Google Sample Videos",
    title: "Big Buck Bunny",
    pageTitle: "Sample Videos",
    extractedFrom: "https://goo.gl/sample",
    extractedAt: Date.now() - 86400000 * 5,
    views: 842317,
    duration: "9:56",
  },
  {
    id: "sample-2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "Google Sample Videos",
    title: "Elephants Dream",
    pageTitle: "Sample Videos",
    extractedFrom: "https://goo.gl/sample",
    extractedAt: Date.now() - 86400000 * 4,
    views: 519420,
    duration: "10:54",
  },
  {
    id: "sample-3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "Google Sample Videos",
    title: "For Bigger Blazes",
    pageTitle: "Sample Videos",
    extractedFrom: "https://goo.gl/sample",
    extractedAt: Date.now() - 86400000 * 3,
    views: 293104,
    duration: "0:15",
  },
  {
    id: "sample-4",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "Google Sample Videos",
    title: "For Bigger Escapes",
    pageTitle: "Sample Videos",
    extractedFrom: "https://goo.gl/sample",
    extractedAt: Date.now() - 86400000 * 2,
    views: 174882,
    duration: "0:15",
  },
  {
    id: "sample-5",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "Google Sample Videos",
    title: "Subaru Outback On Street And Dirt",
    pageTitle: "Sample Videos",
    extractedFrom: "https://goo.gl/sample",
    extractedAt: Date.now() - 86400000 * 1,
    views: 98651,
    duration: "0:56",
  },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [currentVideos, setCurrentVideos] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"new" | "az">("new");

  useEffect(() => {
    const saved = localStorage.getItem("vidtube_v2_library");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0) {
          setAllVideos(parsed);
          return;
        }
      } catch {}
    }
    setAllVideos(SAMPLE_VIDEOS);
  }, []);

  const saveVideos = (videos: VideoItem[]) => {
    setAllVideos(videos);
    localStorage.setItem("vidtube_v2_library", JSON.stringify(videos.slice(0, 300)));
  };

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
        setExtractError("No videos found on this page. Try switching to Deep mode for JavaScript-heavy sites.");
        return;
      }

      const existingUrls = new Set(allVideos.map((v) => v.url));
      const fresh = newVideos.filter((v) => !existingUrls.has(v.url));
      const updated = [...fresh, ...allVideos];
      saveVideos(updated);
      setCurrentVideos(newVideos);
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
    const updated = allVideos.map((v) =>
      v.id === video.id ? { ...v, views: (v.views || 0) + 1 } : v
    );
    saveVideos(updated);
  };

  const handleSearch = (query: string) => {
    if (query.startsWith("http")) {
      handleExtract(query);
      setShowAddModal(false);
    }
  };

  const categories = ["all", ...Array.from(new Set(allVideos.map((v) => v.type).filter(Boolean)))];

  const displayVideos = allVideos
    .filter((v) => activeCategory === "all" || v.type === activeCategory)
    .sort((a, b) => sortBy === "new" ? b.extractedAt - a.extractedAt : a.title.localeCompare(b.title));

  return (
    <div className="min-h-screen" style={{ background: "#141414", color: "#e0e0e0" }}>
      <Header
        onSearch={handleSearch}
        onAddUrl={() => setShowAddModal(true)}
        onHome={() => { setPage("home"); }}
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
        />
      )}
      {page === "watch" && currentVideo && (
        <WatchView
          video={currentVideo}
          relatedVideos={allVideos.filter((v) => v.id !== currentVideo.id)}
          onWatch={handleWatch}
          onBack={() => setPage("home")}
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
