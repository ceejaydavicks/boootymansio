import { useState } from "react";
import { Download, Image, Scissors, ExternalLink, Copy, CheckCircle2, ChevronLeft, Loader2, Film, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VideoItem, Thumbnail } from "../types";
import VideoCard from "../components/VideoCard";

interface WatchViewProps {
  video: VideoItem;
  relatedVideos: VideoItem[];
  onWatch: (video: VideoItem) => void;
  onBack: () => void;
}

export default function WatchView({ video, relatedVideos, onWatch, onBack }: WatchViewProps) {
  const [copied, setCopied] = useState(false);

  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);
  const [thumbResults, setThumbResults] = useState<Thumbnail[]>([]);
  const [thumbCount, setThumbCount] = useState(6);
  const [thumbRes, setThumbRes] = useState("640");
  const [selectedThumbs, setSelectedThumbs] = useState<string[]>([]);
  const [showThumbPanel, setShowThumbPanel] = useState(false);

  const [clipLoading, setClipLoading] = useState(false);
  const [clipError, setClipError] = useState<string | null>(null);
  const [clipResult, setClipResult] = useState<string | null>(null);
  const [clipDuration, setClipDuration] = useState(15);
  const [showClipPanel, setShowClipPanel] = useState(false);

  const filename = video.url.split("/").pop()?.split("?")[0] || "video";
  const displayTitle = video.title || filename;

  const copyUrl = () => {
    navigator.clipboard.writeText(video.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateThumbs = async () => {
    setThumbLoading(true);
    setThumbError(null);
    setThumbResults([]);
    try {
      const res = await fetch("/api/generate-thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: video.url, count: thumbCount, resolution: thumbRes }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setThumbResults(data.thumbnails);
    } catch (e: any) {
      setThumbError(e.message || "Thumbnail generation failed.");
    } finally {
      setThumbLoading(false);
    }
  };

  const generateClip = async () => {
    setClipLoading(true);
    setClipError(null);
    setClipResult(null);
    try {
      const res = await fetch("/api/generate-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: video.url, duration: clipDuration }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setClipResult(data.url);
    } catch (e: any) {
      setClipError(e.message || "Clip generation failed.");
    } finally {
      setClipLoading(false);
    }
  };

  const formatTime = (seconds: string) => {
    const sec = parseFloat(seconds);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h > 0 ? h.toString().padStart(2, "0") + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleThumbSelect = (url: string) =>
    setSelectedThumbs((p) => (p.includes(url) ? p.filter((u) => u !== url) : [...p, url]));

  return (
    <div className="flex flex-col gap-0">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm mb-4 transition-colors w-fit"
      >
        <ChevronLeft size={16} /> Back
      </button>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
            <video
              key={video.url}
              src={video.url}
              controls
              autoPlay
              className="w-full h-full"
              onError={() => {}}
            />
          </div>

          <div>
            <h1 className="text-white font-bold text-xl leading-snug mb-2">{displayTitle}</h1>
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded-full uppercase">
                {video.type || "video"}
              </span>
              <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full">
                {video.label}
              </span>
              <span className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded-full truncate max-w-xs">
                {video.source}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={video.url}
                download
                className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-xl transition-colors"
              >
                <Download size={16} /> Download
              </a>
              <button
                onClick={copyUrl}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  copied ? "bg-green-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                }`}
              >
                {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy URL"}
              </button>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold rounded-xl transition-colors"
              >
                <ExternalLink size={16} /> Open
              </a>
              <button
                onClick={() => { setShowThumbPanel((p) => !p); setShowClipPanel(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  showThumbPanel ? "bg-blue-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                }`}
              >
                <Image size={16} /> Thumbnails
              </button>
              <button
                onClick={() => { setShowClipPanel((p) => !p); setShowThumbPanel(false); }}
                className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                  showClipPanel ? "bg-purple-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                }`}
              >
                <Scissors size={16} /> Create Clip
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showThumbPanel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Image size={18} className="text-blue-400" />
                    <h3 className="text-white font-semibold">Thumbnail Generator</h3>
                    {selectedThumbs.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                        {selectedThumbs.length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={thumbCount}
                      onChange={(e) => setThumbCount(parseInt(e.target.value))}
                      className="bg-zinc-800 border border-white/10 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none"
                    >
                      {[6, 10, 15, 20].map((c) => <option key={c} value={c}>{c} frames</option>)}
                    </select>
                    <select
                      value={thumbRes}
                      onChange={(e) => setThumbRes(e.target.value)}
                      className="bg-zinc-800 border border-white/10 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none"
                    >
                      <option value="320">320px</option>
                      <option value="640">640px</option>
                      <option value="1280">1280px</option>
                    </select>
                    {selectedThumbs.length > 0 && (
                      <a
                        href={selectedThumbs[0]}
                        download
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Download size={12} /> Download ({selectedThumbs.length})
                      </a>
                    )}
                    <button
                      onClick={generateThumbs}
                      disabled={thumbLoading}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {thumbLoading ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
                      Generate
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  {thumbError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                      <AlertCircle size={14} /> {thumbError}
                    </div>
                  )}
                  {thumbLoading && (
                    <div className="flex items-center justify-center py-12 gap-3 text-blue-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Analyzing frames...</span>
                    </div>
                  )}
                  {!thumbLoading && thumbResults.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                      {thumbResults.map((thumb, idx) => {
                        const sel = selectedThumbs.includes(thumb.url);
                        return (
                          <div
                            key={idx}
                            onClick={() => toggleThumbSelect(thumb.url)}
                            className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                              sel ? "border-blue-500 ring-2 ring-blue-500/30" : "border-transparent hover:border-zinc-600"
                            }`}
                          >
                            <img src={thumb.url} alt={`Frame ${idx}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            {sel && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 size={12} className="text-white" />
                              </div>
                            )}
                            <div className="absolute bottom-1.5 left-1.5 flex items-center gap-1 bg-black/70 px-1.5 py-0.5 rounded text-[10px] text-zinc-300">
                              <Clock size={8} /> {formatTime(thumb.timestamp)}
                            </div>
                            <a
                              href={thumb.url}
                              download
                              onClick={(e) => e.stopPropagation()}
                              className="absolute bottom-1.5 right-1.5 w-6 h-6 bg-white/10 hover:bg-blue-500 rounded flex items-center justify-center transition-colors"
                            >
                              <Download size={10} className="text-white" />
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {!thumbLoading && thumbResults.length === 0 && !thumbError && (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                      Hit Generate to extract frame previews from this video
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showClipPanel && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden"
              >
                <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Scissors size={18} className="text-purple-400" />
                    <h3 className="text-white font-semibold">Clip Maker</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={clipDuration}
                      onChange={(e) => setClipDuration(parseInt(e.target.value))}
                      className="bg-zinc-800 border border-white/10 text-zinc-300 text-xs rounded-lg px-3 py-2 outline-none"
                    >
                      {[9, 12, 15, 18].map((d) => <option key={d} value={d}>{d}s mashup</option>)}
                    </select>
                    <button
                      onClick={generateClip}
                      disabled={clipLoading}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      {clipLoading ? <Loader2 size={12} className="animate-spin" /> : <Scissors size={12} />}
                      {clipLoading ? "Generating..." : "Create Clip"}
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  {clipError && (
                    <div className="flex items-center gap-2 text-red-400 text-sm mb-4">
                      <AlertCircle size={14} /> {clipError}
                    </div>
                  )}
                  {clipLoading && (
                    <div className="flex items-center justify-center py-12 gap-3 text-purple-400">
                      <Loader2 size={24} className="animate-spin" />
                      <span className="text-sm">Splicing start, middle & end segments...</span>
                    </div>
                  )}
                  {!clipLoading && clipResult && (
                    <div className="space-y-4">
                      <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/5">
                        <video key={clipResult} src={clipResult} controls autoPlay className="w-full h-full" />
                      </div>
                      <div className="flex gap-3 justify-center">
                        <a
                          href={clipResult}
                          download={`clip_${clipDuration}s.mp4`}
                          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl flex items-center gap-2 transition-colors"
                        >
                          <Download size={16} /> Download MP4
                        </a>
                        <button
                          onClick={() => setClipResult(null)}
                          className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-sm rounded-xl transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                  {!clipLoading && !clipResult && !clipError && (
                    <div className="text-center py-8 text-zinc-600 text-sm">
                      Creates a highlight mashup from the start, middle, and end of this video
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {relatedVideos.length > 0 && (
          <aside className="xl:w-96 flex-shrink-0 flex flex-col gap-3">
            <h2 className="text-white font-semibold text-sm">More videos</h2>
            {relatedVideos.filter((v) => v.id !== video.id).slice(0, 12).map((v) => (
              <VideoCard key={v.id} video={v} onWatch={onWatch} compact />
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
