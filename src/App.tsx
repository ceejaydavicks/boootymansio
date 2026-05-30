import { useState, useEffect } from "react";
import { Page, VideoItem } from "./types";
import Header from "./components/Header";
import HomeView from "./views/HomeView";
import WatchView from "./views/WatchView";
import ToolsView from "./views/ToolsView";
import PublicWatchView from "./views/PublicWatchView";
import AddUrlModal from "./components/AddUrlModal";

const ADMIN_CODE = "BM9x2kqZ7p";
const SMART_LINK = "https://www.effectivecpmnetwork.com/h9xw8i8f?key=1419765068d7b1dbd1e3d5e01e3b7a94";

function genShareId(): string {
  return Math.random().toString(36).slice(2, 7) + Math.random().toString(36).slice(2, 7);
}

function getShareUrl(shareId: string): string {
  return `https://boootymansio.pages.dev/?v=${shareId}`;
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
    extractedAt: Date.now() - 86400000,
    views: 0,
    thumbnail: "https://ticdn.net/splash/98vkekjaqkhvz17g.jpg",
  },
  {
    id: "vid-suv-1",
    shareId: "suv3k9m2xp",
    url: "https://cdn.videy.co/tN1S51Zy1.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "cdn.videy.co",
    title: "Testing the new SUV",
    extractedFrom: "https://cdn.videy.co/tN1S51Zy1.mp4",
    extractedAt: Date.now() - 3600000,
    views: 0,
    thumbnail: "https://ticdn.net/splash/dxq8lr3yzjoiwber.jpg",
  },
  {
    id: "vid-cms-1",
    shareId: "cms7n4p8qr",
    url: "https://cdn2.videy.co/ieEPn7hB1.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "cdn2.videy.co",
    title: "When comfort meets style",
    extractedFrom: "https://cdn2.videy.co/ieEPn7hB1.mp4",
    extractedAt: Date.now() - 3600000,
    views: 0,
    thumbnail: "https://ticdn.net/splash/1pc18gn7arpo1jtq.jpg",
  },
  {
    id: "vid-ese-1",
    shareId: "ese2w6j1nt",
    url: "https://cdn2.videy.co/DzL0U21o1.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "cdn2.videy.co",
    title: "The moment she stepped in, the entire energy shifted 🫦",
    extractedFrom: "https://cdn2.videy.co/DzL0U21o1.mp4",
    extractedAt: Date.now() - 3600000,
    views: 0,
    thumbnail: "https://ticdn.net/snaps/ir46rsasdbvix9xl.jpg",
  },
  {
    id: "vid-sqw-1",
    shareId: "sqw5h3x9bm",
    url: "https://cdn.videy.co/fmZakeUC1.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "cdn.videy.co",
    title: "I stay quiet… but y'all stay watching 😭👀",
    extractedFrom: "https://cdn.videy.co/fmZakeUC1.mp4",
    extractedAt: Date.now() - 3600000,
    views: 0,
    thumbnail: "https://ticdn.net/snaps/59x1iw7iock7ewfe.jpg",
  },
  {
    id: "vid-abt-1",
    shareId: "abt4r2k7pz",
    url: "https://cdn.videy.co/Xg53OzLk1.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "cdn.videy.co",
    title: "Auntie being way too flirtatious.mp4",
    extractedFrom: "https://cdn.videy.co/Xg53OzLk1.mp4",
    extractedAt: Date.now() - 3600000,
    views: 0,
    thumbnail: "https://ticdn.net/splash/fwpwi8yp0l7wc2qb.jpg",
  },
  {
    id: "vid-lkg-1",
    shareId: "lkg8v5n2wq",
    url: "https://cdn.videy.co/86ShoErv1.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "cdn.videy.co",
    title: "Lowkey gorgeous. Highkey aware. 😌",
    extractedFrom: "https://cdn.videy.co/86ShoErv1.mp4",
    extractedAt: Date.now() - 3600000,
    views: 0,
    thumbnail: "https://ticdn.net/splash/tthjq9j8uacwqufa.jpg",
  },
  {
    id: "vid-mwc-1",
    shareId: "mwc9j6t3yx",
    url: "https://cdn.videy.co/FcA80E4v1.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "cdn.videy.co",
    title: "morning workout with the clown 😭",
    extractedFrom: "https://cdn.videy.co/FcA80E4v1.mp4",
    extractedAt: Date.now() - 3600000,
    views: 0,
    thumbnail: "https://ticdn.net/splash/4voze5t1zn04gd3m.jpg",
  },
  {
    id: "vid-abt-2",
    shareId: "abt2p8m5vk",
    url: "https://cdn.videy.co/UcnEsABO1.mp4",
    type: "mp4",
    label: "Direct Video",
    source: "cdn.videy.co",
    title: "Wait till you see how Auntie does bath time 😍👇",
    extractedFrom: "https://cdn.videy.co/UcnEsABO1.mp4",
    extractedAt: Date.now(),
    views: 0,
    thumbnail: "https://ticdn.net/splash/evsturd1u9rtfwxy.jpg",
  },
];

type AppMode = "loading" | "public" | "admin" | "redirect";

export default function App() {
  const [mode, setMode] = useState<AppMode>("loading");
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
    const adminParam = params.get("admin");

    if (vParam) {
      setPublicShareId(vParam);
      setMode("public");
    } else {
      setMode("admin");
    }

    const saved = localStorage.getItem("vidtube_v5_library");
    if (saved) {
      try {
        const parsed: VideoItem[] = JSON.parse(saved);
        const withShareIds = parsed.map((v) => ({
          ...v,
          shareId: v.shareId || genShareId(),
        }));
        const savedIds = new Set(withShareIds.map((v) => v.id));
        const missingInitial = INITIAL_VIDEOS.filter((v) => !savedIds.has(v.id));
        setAllVideos([...missingInitial, ...withShareIds]);
      } catch {
        localStorage.removeItem("vidtube_v5_library");
        setAllVideos(INITIAL_VIDEOS);
      }
    } else {
      setAllVideos(INITIAL_VIDEOS);
    }
  }, []);

  useEffect(() => {
    if (mode === "admin" && allVideos.length > 0) {
      localStorage.setItem("vidtube_v5_library", JSON.stringify(allVideos.slice(0, 300)));
    }
  }, [allVideos, mode]);

  const handleExtract = async (url: string, extractMode: "fast" | "deep" = "fast") => {
    setExtractLoading(true);
    setExtractError(null);
    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, mode: extractMode }),
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
    if (query.startsWith("http")) handleExtract(query);
  };

  if (mode === "loading" || mode === "redirect") {
    return null;
  }

  if (mode === "public") {
    const video = allVideos.find((v) => v.shareId === publicShareId) ?? null;
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
