import { useState } from "react";
import { Play, Search, Zap, Image, Scissors, ArrowRight } from "lucide-react";
import { VideoItem, Page } from "../types";
import VideoCard from "../components/VideoCard";

interface HomeViewProps {
  allVideos: VideoItem[];
  onWatch: (video: VideoItem) => void;
  onNavigate: (page: Page, url?: string) => void;
  onExtract: (url: string) => void;
}

export default function HomeView({ allVideos, onWatch, onNavigate, onExtract }: HomeViewProps) {
  const [heroUrl, setHeroUrl] = useState("");

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroUrl.trim()) return;
    onExtract(heroUrl.trim());
    setHeroUrl("");
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-900 via-red-950/30 to-zinc-900 border border-white/5 p-8 md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.1),transparent_60%)]" />
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Play size={16} className="text-white fill-white ml-0.5" />
            </div>
            <span className="text-red-400 text-sm font-semibold uppercase tracking-wider">VidTube</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Extract & Watch<br />
            <span className="text-red-500">Videos from Anywhere</span>
          </h1>
          <p className="text-zinc-400 text-base mb-8 leading-relaxed">
            Paste any webpage URL to instantly discover and stream embedded videos. Generate thumbnails and create preview clips.
          </p>
          <form onSubmit={handleHeroSearch} className="flex gap-2 max-w-xl">
            <div className="flex-1 flex items-center bg-black/50 border border-white/10 rounded-xl px-4 focus-within:border-red-500 transition-colors">
              <Search size={16} className="text-zinc-500 mr-3 flex-shrink-0" />
              <input
                type="text"
                value={heroUrl}
                onChange={(e) => setHeroUrl(e.target.value)}
                placeholder="https://example.com/video-page"
                className="flex-1 bg-transparent text-white text-sm py-3.5 outline-none placeholder:text-zinc-600"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              Extract <ArrowRight size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Zap, title: "Fast Extraction", desc: "Instantly parse HTML for video links using smart detection", color: "text-yellow-400", bg: "bg-yellow-400/10" },
          { icon: Image, title: "Thumbnail Generator", desc: "Generate high-density frame previews from any video stream", color: "text-blue-400", bg: "bg-blue-400/10" },
          { icon: Scissors, title: "Clip Maker", desc: "Create start/middle/end highlight mashups from any source", color: "text-purple-400", bg: "bg-purple-400/10" },
        ].map(({ icon: Icon, title, desc, color, bg }) => (
          <div key={title} className="bg-zinc-900/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
              <Icon size={20} className={color} />
            </div>
            <h3 className="text-white font-semibold mb-1">{title}</h3>
            <p className="text-zinc-500 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {allVideos.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-white font-bold text-xl">Your Library</h2>
            <button
              onClick={() => onNavigate("browse")}
              className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
            >
              Browse more <ArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {allVideos.slice(0, 12).map((video) => (
              <VideoCard key={video.id} video={video} onWatch={onWatch} />
            ))}
          </div>
        </section>
      )}

      {allVideos.length === 0 && (
        <section className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4">
            <Play size={32} className="text-zinc-600" />
          </div>
          <h3 className="text-zinc-400 font-semibold text-lg mb-2">No videos yet</h3>
          <p className="text-zinc-600 text-sm mb-6">Extract videos from any URL to start building your library</p>
          <button
            onClick={() => onNavigate("browse")}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl transition-colors inline-flex items-center gap-2"
          >
            Start Browsing <ArrowRight size={16} />
          </button>
        </section>
      )}
    </div>
  );
}
