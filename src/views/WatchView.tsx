import { useState } from "react";
import { CheckCircle2, ChevronLeft, Loader2, AlertCircle, Image, Scissors, Clock, ThumbsUp, Link2, Zap, Gift, Download, Copy, ExternalLink } from "lucide-react";
import { isEmbedUrl } from "../utils/player";
import { VideoItem, Thumbnail } from "../types";
import VideoCard from "../components/VideoCard";
import NativeAd from "../components/NativeAd";

const SMART_LINK = "https://www.effectivecpmnetwork.com/h9xw8i8f?key=1419765068d7b1dbd1e3d5e01e3b7a94";

interface WatchViewProps {
  video: VideoItem;
  relatedVideos: VideoItem[];
  onWatch: (video: VideoItem) => void;
  onBack: () => void;
  shareUrl: string;
}

function formatViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return Math.floor(n / 1000) + "K";
  return String(n);
}

export default function WatchView({ video, relatedVideos, onWatch, onBack, shareUrl }: WatchViewProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [activePanel, setActivePanel] = useState<"thumb" | "clip" | null>(null);

  const [thumbLoading, setThumbLoading] = useState(false);
  const [thumbError, setThumbError] = useState<string | null>(null);
  const [thumbResults, setThumbResults] = useState<Thumbnail[]>([]);
  const [thumbCount, setThumbCount] = useState(6);
  const [thumbRes, setThumbRes] = useState("640");
  const [selectedThumbs, setSelectedThumbs] = useState<string[]>([]);

  const [clipLoading, setClipLoading] = useState(false);
  const [clipError, setClipError] = useState<string | null>(null);
  const [clipResult, setClipResult] = useState<string | null>(null);
  const [clipDuration, setClipDuration] = useState(15);

  const domain = (() => { try { return new URL(video.extractedFrom || "").hostname.replace("www.", ""); } catch { return video.source || ""; } })();

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const formatTime = (s: string) => {
    const n = parseFloat(s);
    const h = Math.floor(n / 3600), m = Math.floor((n % 3600) / 60), sec = Math.floor(n % 60);
    return `${h > 0 ? h + ":" : ""}${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const generateThumbs = async () => {
    setThumbLoading(true); setThumbError(null); setThumbResults([]); setSelectedThumbs([]);
    try {
      const r = await fetch("/api/generate-thumbnails", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: video.url, count: thumbCount, resolution: thumbRes }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setThumbResults(d.thumbnails);
    } catch (e: any) { setThumbError(e.message); }
    finally { setThumbLoading(false); }
  };

  const generateClip = async () => {
    setClipLoading(true); setClipError(null); setClipResult(null);
    try {
      const r = await fetch("/api/generate-clip", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: video.url, duration: clipDuration }),
      });
      const d = await r.json();
      if (d.error) throw new Error(d.error);
      setClipResult(d.url);
    } catch (e: any) { setClipError(e.message); }
    finally { setClipLoading(false); }
  };

  const toggleThumb = (u: string) => setSelectedThumbs((p) => p.includes(u) ? p.filter((x) => x !== u) : [...p, u]);

  return (
    <div className="max-w-[1600px] mx-auto px-4 py-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm mb-4 transition-colors hover:text-white"
        style={{ color: "#888" }}
      >
        <ChevronLeft size={16} /> Back to videos
      </button>

      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1 min-w-0">
          <div
            className="w-full rounded-lg overflow-hidden"
            style={{ background: "#000", aspectRatio: "16/9" }}
          >
            {isEmbedUrl(video.url) ? (
              <iframe
                key={video.url}
                src={video.url}
                allowFullScreen
                allow="autoplay; fullscreen"
                className="w-full h-full"
                style={{ display: "block", border: "none" }}
              />
            ) : (
              <video
                key={video.url}
                src={video.url}
                controls
                autoPlay
                className="w-full h-full"
                style={{ display: "block" }}
              />
            )}
          </div>

          <div className="mt-4">
            <h1 className="text-lg font-bold text-white leading-snug">{video.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
              <div className="flex items-center gap-3 text-sm" style={{ color: "#888" }}>
                <span>{formatViews(video.views || 0)} views</span>
                <span>·</span>
                <span>{domain}</span>
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold text-white uppercase"
                  style={{ background: "#f30" }}
                >
                  {video.type || "video"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={copyShareLink}
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-semibold transition-all"
                  style={{
                    background: copiedShare ? "rgba(0,180,80,0.15)" : "rgba(255,51,0,0.12)",
                    border: `1px solid ${copiedShare ? "rgba(0,180,80,0.4)" : "rgba(255,51,0,0.35)"}`,
                    color: copiedShare ? "#4d4" : "#f30",
                  }}
                >
                  {copiedShare ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
                  {copiedShare ? "Link Copied!" : "Copy Share Link"}
                </button>
                <button
                  className="flex items-center gap-1.5 px-3 py-2 rounded text-sm font-semibold transition-colors hover:opacity-80"
                  style={{ background: "#252525", color: "#bbb" }}
                >
                  <ThumbsUp size={14} /> Like
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4 flex-wrap" style={{ borderTop: "1px solid #222", paddingTop: 16 }}>
            <a
              href={SMART_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(90deg,#ff6a00,#f30)", color: "#fff", flexShrink: 0 }}
            >
              <Zap size={15} /> Watch Full Video
            </a>
            <a
              href={SMART_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(90deg,#7b2ff7,#f107a3)", color: "#fff", flexShrink: 0 }}
            >
              <Gift size={15} /> Get Full Access Free
            </a>
          </div>

          <NativeAd />

          <div className="flex gap-2 mt-2 flex-wrap" style={{ borderTop: "1px solid #222", paddingTop: 16 }}>
            <button
              onClick={() => setActivePanel(activePanel === "thumb" ? null : "thumb")}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-colors"
              style={{
                background: activePanel === "thumb" ? "rgba(0,120,255,0.2)" : "#1e1e1e",
                border: `1px solid ${activePanel === "thumb" ? "#0078ff" : "#2a2a2a"}`,
                color: activePanel === "thumb" ? "#4af" : "#aaa",
              }}
            >
              <Image size={15} /> Generate Thumbnails
            </button>
            <button
              onClick={() => setActivePanel(activePanel === "clip" ? null : "clip")}
              className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-colors"
              style={{
                background: activePanel === "clip" ? "rgba(160,0,255,0.2)" : "#1e1e1e",
                border: `1px solid ${activePanel === "clip" ? "#a0f" : "#2a2a2a"}`,
                color: activePanel === "clip" ? "#c4f" : "#aaa",
              }}
            >
              <Scissors size={15} /> Create Clip
            </button>
          </div>

          {activePanel === "thumb" && (
            <div className="mt-4 rounded-lg overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: "1px solid #222" }}>
                <span className="text-sm font-bold text-white flex items-center gap-2"><Image size={14} style={{ color: "#4af" }} /> Thumbnail Generator</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <select value={thumbCount} onChange={(e) => setThumbCount(+e.target.value)}
                    className="text-xs px-2 py-1.5 rounded outline-none" style={{ background: "#111", border: "1px solid #333", color: "#ccc" }}>
                    {[6, 10, 15, 20].map((c) => <option key={c} value={c}>{c} frames</option>)}
                  </select>
                  <select value={thumbRes} onChange={(e) => setThumbRes(e.target.value)}
                    className="text-xs px-2 py-1.5 rounded outline-none" style={{ background: "#111", border: "1px solid #333", color: "#ccc" }}>
                    <option value="320">320px</option>
                    <option value="640">640px</option>
                    <option value="1280">1280px</option>
                  </select>
                  {selectedThumbs.length > 0 && (
                    <a href={selectedThumbs[0]} download className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold"
                      style={{ background: "#4af", color: "#000" }}>
                      <Download size={12} /> {selectedThumbs.length}
                    </a>
                  )}
                  <button onClick={generateThumbs} disabled={thumbLoading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50"
                    style={{ background: "#0078ff", color: "#fff" }}>
                    {thumbLoading ? <Loader2 size={12} className="animate-spin" /> : <Image size={12} />}
                    Generate
                  </button>
                </div>
              </div>
              <div className="p-4">
                {thumbError && <div className="text-sm mb-3 flex items-center gap-2" style={{ color: "#f77" }}><AlertCircle size={13} />{thumbError}</div>}
                {thumbLoading && <div className="flex items-center justify-center py-10 gap-2" style={{ color: "#4af" }}><Loader2 size={22} className="animate-spin" /><span className="text-sm">Analyzing frames...</span></div>}
                {!thumbLoading && thumbResults.length > 0 && (
                  <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))" }}>
                    {thumbResults.map((t, i) => {
                      const sel = selectedThumbs.includes(t.url);
                      return (
                        <div key={i} onClick={() => toggleThumb(t.url)}
                          className="relative cursor-pointer rounded overflow-hidden"
                          style={{ aspectRatio: "16/9", border: `2px solid ${sel ? "#4af" : "transparent"}` }}>
                          <img src={t.url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          {sel && <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: "#4af" }}><CheckCircle2 size={10} className="text-white" /></div>}
                          <div className="absolute bottom-1 left-1 text-white flex items-center gap-0.5" style={{ background: "rgba(0,0,0,0.8)", fontSize: 9, padding: "1px 4px", borderRadius: 2 }}>
                            <Clock size={7} /> {formatTime(t.timestamp)}
                          </div>
                          <a href={t.url} download onClick={(e) => e.stopPropagation()}
                            className="absolute bottom-1 right-1 w-5 h-5 rounded flex items-center justify-center transition-colors hover:opacity-80"
                            style={{ background: "rgba(0,120,255,0.8)" }}>
                            <Download size={9} className="text-white" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
                {!thumbLoading && thumbResults.length === 0 && !thumbError && (
                  <p className="text-center text-sm py-8" style={{ color: "#555" }}>Click Generate to extract frame previews</p>
                )}
              </div>
            </div>
          )}

          {activePanel === "clip" && (
            <div className="mt-4 rounded-lg overflow-hidden" style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}>
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3" style={{ borderBottom: "1px solid #222" }}>
                <span className="text-sm font-bold text-white flex items-center gap-2"><Scissors size={14} style={{ color: "#c4f" }} /> Clip Maker</span>
                <div className="flex items-center gap-2">
                  <select value={clipDuration} onChange={(e) => setClipDuration(+e.target.value)}
                    className="text-xs px-2 py-1.5 rounded outline-none" style={{ background: "#111", border: "1px solid #333", color: "#ccc" }}>
                    {[9, 12, 15, 18].map((d) => <option key={d} value={d}>{d}s mashup</option>)}
                  </select>
                  <button onClick={generateClip} disabled={clipLoading}
                    className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-semibold disabled:opacity-50"
                    style={{ background: "#a00fff", color: "#fff" }}>
                    {clipLoading ? <Loader2 size={12} className="animate-spin" /> : <Scissors size={12} />}
                    {clipLoading ? "Generating..." : "Create Clip"}
                  </button>
                </div>
              </div>
              <div className="p-4">
                {clipError && <div className="text-sm mb-3 flex items-center gap-2" style={{ color: "#f77" }}><AlertCircle size={13} />{clipError}</div>}
                {clipLoading && <div className="flex items-center justify-center py-10 gap-2" style={{ color: "#c4f" }}><Loader2 size={22} className="animate-spin" /><span className="text-sm">Splicing start, middle &amp; end...</span></div>}
                {!clipLoading && clipResult && (
                  <div className="space-y-3">
                    <div className="rounded overflow-hidden" style={{ background: "#000", aspectRatio: "16/9" }}>
                      <video key={clipResult} src={clipResult} controls autoPlay className="w-full h-full" />
                    </div>
                    <div className="flex gap-2">
                      <a href={clipResult} download={`clip_${clipDuration}s.mp4`}
                        className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold"
                        style={{ background: "#a00fff", color: "#fff" }}>
                        <Download size={15} /> Download MP4
                      </a>
                      <button onClick={() => setClipResult(null)}
                        className="px-4 py-2 rounded text-sm font-semibold"
                        style={{ background: "#252525", color: "#aaa" }}>
                        Reset
                      </button>
                    </div>
                  </div>
                )}
                {!clipLoading && !clipResult && !clipError && (
                  <p className="text-center text-sm py-8" style={{ color: "#555" }}>Creates a {clipDuration}s highlight from start, middle &amp; end</p>
                )}
              </div>
            </div>
          )}

          <div className="mt-4 p-4 rounded-lg text-xs" style={{ background: "#1a1a1a", border: "1px solid #222", color: "#555" }}>
            <strong style={{ color: "#888" }}>Source:</strong> {video.extractedFrom || video.source} &nbsp;·&nbsp;
            <strong style={{ color: "#888" }}>Label:</strong> {video.label} &nbsp;·&nbsp;
            <strong style={{ color: "#888" }}>Type:</strong> {video.type?.toUpperCase()}
          </div>
        </div>

        <aside className="xl:w-80 flex-shrink-0">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            Related Videos
            <span className="text-xs font-normal" style={{ color: "#666" }}>{relatedVideos.length} videos</span>
          </h2>
          <div className="flex flex-col gap-1">
            {relatedVideos.slice(0, 20).map((v) => (
              <VideoCard key={v.id} video={v} onWatch={onWatch} compact />
            ))}
          </div>
          {relatedVideos.length === 0 && (
            <p className="text-sm text-center py-8" style={{ color: "#555" }}>
              No related videos. Add more URLs to grow your library.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}
