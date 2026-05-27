import { useState } from "react";
import { Image, Scissors, Loader2, AlertCircle, Download, CheckCircle2, Clock, Video } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Thumbnail } from "../types";

export default function ToolsView() {
  const [thumbUrl, setThumbUrl] = useState("");
  const [thumbCount, setThumbCount] = useState(6);
  const [thumbRes, setThumbRes] = useState("640");
  const [thumbResults, setThumbResults] = useState<Thumbnail[]>([]);
  const [selectedThumbs, setSelectedThumbs] = useState<string[]>([]);
  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);

  const [clipUrl, setClipUrl] = useState("");
  const [clipDuration, setClipDuration] = useState(15);
  const [clipResult, setClipResult] = useState<string | null>(null);
  const [clipLoading, setClipLoading] = useState(false);
  const [clipError, setClipError] = useState<string | null>(null);

  const generateThumbs = async () => {
    if (!thumbUrl) return;
    setThumbLoading(true);
    setThumbError(null);
    setThumbResults([]);
    setSelectedThumbs([]);
    try {
      const res = await fetch("/api/generate-thumbnails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: thumbUrl, count: thumbCount, resolution: thumbRes }),
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
    if (!clipUrl) return;
    setClipLoading(true);
    setClipError(null);
    setClipResult(null);
    try {
      const res = await fetch("/api/generate-clip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: clipUrl, duration: clipDuration }),
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

  const toggleThumbSelect = (url: string) =>
    setSelectedThumbs((p) => (p.includes(url) ? p.filter((u) => u !== url) : [...p, url]));

  const formatTime = (seconds: string) => {
    const sec = parseFloat(seconds);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = Math.floor(sec % 60);
    return `${h > 0 ? h.toString().padStart(2, "0") + ":" : ""}${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const downloadSelected = () => {
    selectedThumbs.forEach((url, idx) => {
      setTimeout(() => {
        const a = document.createElement("a");
        a.href = url;
        a.setAttribute("download", `thumbnail-${idx}.png`);
        document.body.appendChild(a);
        a.click();
        a.remove();
      }, idx * 300);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-white font-bold text-2xl mb-1">Tools</h1>
        <p className="text-zinc-500 text-sm">Generate thumbnails and create clip mashups from direct video URLs</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Image size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Thumbnail Generator</h2>
              <p className="text-zinc-500 text-xs">Extract representative frames from video streams</p>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-4 flex-1">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-2">Video URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={thumbUrl}
                  onChange={(e) => setThumbUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-zinc-600 font-mono pr-10"
                />
                <Video size={14} className="absolute right-3.5 top-3.5 text-zinc-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-2">Frames</label>
                <select
                  value={thumbCount}
                  onChange={(e) => setThumbCount(parseInt(e.target.value))}
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none focus:border-blue-500"
                >
                  {[6, 10, 15, 20].map((c) => <option key={c} value={c}>{c} thumbnails</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-2">Resolution</label>
                <select
                  value={thumbRes}
                  onChange={(e) => setThumbRes(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none focus:border-blue-500"
                >
                  <option value="320">320px (Low)</option>
                  <option value="640">640px (Med)</option>
                  <option value="1280">1280px (HD)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={generateThumbs}
                disabled={thumbLoading || !thumbUrl}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {thumbLoading ? <Loader2 size={16} className="animate-spin" /> : <Image size={16} />}
                {thumbLoading ? "Analyzing..." : "Generate Thumbnails"}
              </button>
              {selectedThumbs.length > 0 && (
                <button
                  onClick={downloadSelected}
                  className="px-4 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold text-sm rounded-xl transition-colors flex items-center gap-2"
                >
                  <Download size={16} /> {selectedThumbs.length}
                </button>
              )}
            </div>
            {thumbError && (
              <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertCircle size={14} /> {thumbError}
              </div>
            )}
            {thumbLoading && (
              <div className="flex items-center justify-center py-10 gap-3 text-blue-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm">Analyzing visual sharpness...</span>
              </div>
            )}
            {!thumbLoading && thumbResults.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                <AnimatePresence>
                  {thumbResults.map((thumb, idx) => {
                    const sel = selectedThumbs.includes(thumb.url);
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.04 }}
                        onClick={() => toggleThumbSelect(thumb.url)}
                        className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                          sel ? "border-blue-500 ring-2 ring-blue-500/20" : "border-transparent hover:border-zinc-600"
                        }`}
                      >
                        <img src={thumb.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        {sel && (
                          <div className="absolute top-1 right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 size={11} className="text-white" />
                          </div>
                        )}
                        <div className="absolute bottom-1 left-1 flex items-center gap-1 bg-black/80 px-1 py-0.5 rounded text-[9px] text-zinc-300">
                          <Clock size={7} /> {formatTime(thumb.timestamp)}
                        </div>
                        <a
                          href={thumb.url}
                          download
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-1 right-1 w-5 h-5 bg-black/60 hover:bg-blue-600 rounded flex items-center justify-center transition-colors"
                        >
                          <Download size={9} className="text-white" />
                        </a>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-white/5 flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Scissors size={18} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">Clip Maker</h2>
              <p className="text-zinc-500 text-xs">Create a highlight mashup from start, middle & end</p>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-4 flex-1">
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-2">Video URL</label>
              <div className="relative">
                <input
                  type="text"
                  value={clipUrl}
                  onChange={(e) => setClipUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4"
                  className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 transition-colors placeholder:text-zinc-600 font-mono pr-10"
                />
                <Scissors size={14} className="absolute right-3.5 top-3.5 text-zinc-600" />
              </div>
            </div>
            <div>
              <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold block mb-2">Clip Duration</label>
              <select
                value={clipDuration}
                onChange={(e) => setClipDuration(parseInt(e.target.value))}
                className="w-full bg-zinc-800/50 border border-white/10 rounded-xl px-3 py-2.5 text-zinc-300 text-sm outline-none focus:border-purple-500"
              >
                {[9, 12, 15, 18].map((d) => <option key={d} value={d}>{d} seconds total ({d/3}s × 3 segments)</option>)}
              </select>
            </div>
            <div className="p-4 bg-zinc-800/50 rounded-xl space-y-2">
              {[
                "Segment 1 — From the beginning (10%)",
                "Segment 2 — From the middle",
                "Segment 3 — Near the end",
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-zinc-500">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  {s}
                </div>
              ))}
            </div>
            <button
              onClick={generateClip}
              disabled={clipLoading || !clipUrl}
              className="py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {clipLoading ? <Loader2 size={16} className="animate-spin" /> : <Scissors size={16} />}
              {clipLoading ? "Generating clip..." : "Create Mashup Clip"}
            </button>
            {clipError && (
              <div className="flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertCircle size={14} /> {clipError}
              </div>
            )}
            {clipLoading && (
              <div className="flex items-center justify-center py-10 gap-3 text-purple-400">
                <Loader2 size={24} className="animate-spin" />
                <span className="text-sm">Splicing media streams...</span>
              </div>
            )}
            {!clipLoading && clipResult && (
              <div className="space-y-3">
                <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/5">
                  <video key={clipResult} src={clipResult} controls autoPlay className="w-full h-full" />
                </div>
                <div className="flex gap-2">
                  <a
                    href={clipResult}
                    download={`clip_${clipDuration}s.mp4`}
                    className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    <Download size={16} /> Download MP4
                  </a>
                  <button
                    onClick={() => setClipResult(null)}
                    className="px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 text-sm rounded-xl transition-colors"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
