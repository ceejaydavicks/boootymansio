import { useState } from "react";
import { Play, Copy, CheckCircle2, Download, ExternalLink, Link2, AlertTriangle, Zap, Gift } from "lucide-react";
import { isEmbedUrl } from "../utils/player";
import { VideoItem } from "../types";
import NativeAd from "../components/NativeAd";

const SMART_LINK = "https://www.effectivecpmnetwork.com/h9xw8i8f?key=1419765068d7b1dbd1e3d5e01e3b7a94";

interface PublicWatchViewProps {
  video: VideoItem | null;
  shareUrl: string;
}

function formatViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return Math.floor(n / 1_000) + "K";
  return String(n);
}

export default function PublicWatchView({ video, shareUrl }: PublicWatchViewProps) {
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const copyVideoUrl = () => {
    if (!video) return;
    navigator.clipboard.writeText(video.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0d0d0d" }}>
      <header
        className="flex items-center justify-between px-5 h-13"
        style={{ background: "#111", borderBottom: "1px solid #222", height: 52 }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-white font-black text-xl tracking-tight"
            style={{ background: "#f30", padding: "2px 7px", borderRadius: 4 }}
          >
            X
          </span>
          <span className="text-white font-bold text-base tracking-tight hidden sm:inline">
            VIDEOS
          </span>
        </div>
        <button
          onClick={copyShare}
          className="flex items-center gap-2 px-4 py-2 rounded text-sm font-semibold transition-all"
          style={{
            background: copiedShare ? "#1a3a1a" : "#1e1e1e",
            border: `1px solid ${copiedShare ? "#2a5a2a" : "#333"}`,
            color: copiedShare ? "#5f5" : "#aaa",
          }}
        >
          {copiedShare ? <CheckCircle2 size={14} /> : <Link2 size={14} />}
          {copiedShare ? "Link Copied!" : "Share This Video"}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start py-6 px-4">
        {!video ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-4 py-24 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ background: "#1e1e1e", border: "1px solid #2a2a2a" }}
            >
              <AlertTriangle size={36} style={{ color: "#f30" }} />
            </div>
            <h1 className="text-xl font-bold text-white">Video Not Found</h1>
            <p className="text-sm max-w-sm" style={{ color: "#777" }}>
              This link is invalid or the video has been removed. Ask the person who shared it for an updated link.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-4xl">
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

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-sm" style={{ color: "#888" }}>
                  {formatViews(video.views || 0)} views
                </span>
                {video.duration && (
                  <span className="text-sm" style={{ color: "#888" }}>
                    · {video.duration}
                  </span>
                )}
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold text-white uppercase"
                  style={{ background: "#f30" }}
                >
                  {video.type || "video"}
                </span>
              </div>

              <div
                className="flex flex-wrap gap-2 mt-4 pt-4"
                style={{ borderTop: "1px solid #222" }}
              >
                <button
                  onClick={copyShare}
                  className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all"
                  style={{
                    background: copiedShare ? "#1a3a1a" : "#1e1e1e",
                    border: `1px solid ${copiedShare ? "#2a5a2a" : "#2a2a2a"}`,
                    color: copiedShare ? "#5f5" : "#ccc",
                  }}
                >
                  {copiedShare ? <CheckCircle2 size={15} /> : <Link2 size={15} />}
                  {copiedShare ? "Link Copied!" : "Copy Share Link"}
                </button>

                <button
                  onClick={copyVideoUrl}
                  className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-all"
                  style={{
                    background: copiedUrl ? "#1a3a1a" : "#1e1e1e",
                    border: `1px solid ${copiedUrl ? "#2a5a2a" : "#2a2a2a"}`,
                    color: copiedUrl ? "#5f5" : "#ccc",
                  }}
                >
                  {copiedUrl ? <CheckCircle2 size={15} /> : <Copy size={15} />}
                  {copiedUrl ? "Copied!" : "Copy Direct URL"}
                </button>

                <a
                  href={video.url}
                  download
                  className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "#f30", color: "#fff" }}
                >
                  <Download size={15} /> Download
                </a>

                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold"
                  style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#ccc" }}
                >
                  <ExternalLink size={15} /> Open Source
                </a>
              </div>

              <div className="flex gap-3 mt-5 flex-wrap">
                <a
                  href={SMART_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded text-sm font-bold transition-opacity hover:opacity-90 flex-1 justify-center"
                  style={{ background: "linear-gradient(90deg,#ff6a00,#f30)", color: "#fff" }}
                >
                  <Zap size={16} /> Watch Full Video
                </a>
                <a
                  href={SMART_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded text-sm font-bold transition-opacity hover:opacity-90 flex-1 justify-center"
                  style={{ background: "linear-gradient(90deg,#7b2ff7,#f107a3)", color: "#fff" }}
                >
                  <Gift size={16} /> Get Full Access Free
                </a>
              </div>

              <NativeAd />

              <div
                className="mt-2 p-4 rounded-lg flex items-center gap-3"
                style={{ background: "#161616", border: "1px solid #222" }}
              >
                <Link2 size={16} style={{ color: "#f30", flexShrink: 0 }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs mb-1" style={{ color: "#666" }}>Your private link to this video</p>
                  <p
                    className="text-sm font-mono truncate"
                    style={{ color: "#aaa" }}
                  >
                    {shareUrl}
                  </p>
                </div>
                <button
                  onClick={copyShare}
                  className="flex-shrink-0 px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                  style={{
                    background: copiedShare ? "#2a5a2a" : "#252525",
                    color: copiedShare ? "#5f5" : "#888",
                  }}
                >
                  {copiedShare ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer
        className="text-center py-4 text-xs"
        style={{ color: "#444", borderTop: "1px solid #1a1a1a" }}
      >
        Powered by <span style={{ color: "#f30" }}>X VIDEOS</span>
      </footer>
    </div>
  );
}
