import { useState, useEffect } from "react";
import { Page, VideoItem } from "./types";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import HomeView from "./views/HomeView";
import BrowseView from "./views/BrowseView";
import WatchView from "./views/WatchView";
import ToolsView from "./views/ToolsView";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [allVideos, setAllVideos] = useState<VideoItem[]>([]);
  const [currentVideos, setCurrentVideos] = useState<VideoItem[]>([]);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [currentPageTitle, setCurrentPageTitle] = useState("");

  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);
  const [pendingUrl, setPendingUrl] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("vidtube_library");
    if (saved) {
      try { setAllVideos(JSON.parse(saved)); } catch {}
    }
  }, []);

  const saveVideos = (videos: VideoItem[]) => {
    setAllVideos(videos);
    localStorage.setItem("vidtube_library", JSON.stringify(videos.slice(0, 200)));
  };

  const handleExtract = async (url: string, mode: "fast" | "deep" = "fast") => {
    setExtractLoading(true);
    setExtractError(null);
    setCurrentVideos([]);
    setCurrentPageTitle("");
    setPage("browse");

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
        type: r.type,
        label: r.label,
        source: r.source,
        title: r.url.split("/").pop()?.split("?")[0] || "video",
        pageTitle: data.pageTitle,
        extractedFrom: url,
        extractedAt: Date.now(),
      }));

      setCurrentVideos(newVideos);
      setCurrentPageTitle(data.pageTitle || url);

      if (newVideos.length > 0) {
        const existingUrls = new Set(allVideos.map((v) => v.url));
        const fresh = newVideos.filter((v) => !existingUrls.has(v.url));
        saveVideos([...fresh, ...allVideos]);
      } else {
        setExtractError("No video links found on this page. Try Deep mode for JavaScript-rendered content.");
      }
    } catch (e: any) {
      setExtractError(e.message || "Failed to extract videos.");
    } finally {
      setExtractLoading(false);
    }
  };

  const handleWatch = (video: VideoItem) => {
    setCurrentVideo(video);
    setPage("watch");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (p: Page, url?: string) => {
    if (url) {
      handleExtract(url);
    } else {
      setPage(p);
    }
  };

  const handleSearch = (url: string) => {
    handleExtract(url);
  };

  const handleBack = () => {
    if (currentVideos.length > 0) {
      setPage("browse");
    } else {
      setPage("home");
    }
  };

  const relatedVideos =
    currentVideo && currentVideos.length > 0
      ? currentVideos
      : allVideos;

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      <Header
        onNavigate={handleNavigate}
        onToggleSidebar={() => setSidebarOpen((p) => !p)}
        onSearch={handleSearch}
      />

      <div className="flex pt-14 min-h-screen">
        <Sidebar
          open={sidebarOpen}
          currentPage={page}
          onNavigate={setPage}
          recentVideos={allVideos}
          onWatch={handleWatch}
        />

        <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-x-hidden">
          {page === "home" && (
            <HomeView
              allVideos={allVideos}
              onWatch={handleWatch}
              onNavigate={handleNavigate}
              onExtract={handleExtract}
            />
          )}
          {page === "browse" && (
            <BrowseView
              videos={currentVideos}
              loading={extractLoading}
              error={extractError}
              currentPageTitle={currentPageTitle}
              onExtract={handleExtract}
              onWatch={handleWatch}
              initialUrl={pendingUrl}
            />
          )}
          {page === "watch" && currentVideo && (
            <WatchView
              video={currentVideo}
              relatedVideos={relatedVideos}
              onWatch={handleWatch}
              onBack={handleBack}
            />
          )}
          {page === "tools" && <ToolsView />}
        </main>
      </div>
    </div>
  );
}
