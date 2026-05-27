import { Play, Film } from "lucide-react";
import { VideoItem } from "../types";

const GRADIENTS: Record<string, string> = {
  mp4: "linear-gradient(135deg, #1a0505 0%, #3d0a0a 50%, #1a0505 100%)",
  m3u8: "linear-gradient(135deg, #05051a 0%, #0a0a3d 50%, #05051a 100%)",
  webm: "linear-gradient(135deg, #051a05 0%, #0a3d1a 50%, #051a05 100%)",
  mov: "linear-gradient(135deg, #1a1205 0%, #3d2e0a 50%, #1a1205 100%)",
  mpd: "linear-gradient(135deg, #1a0510 0%, #3d0a22 50%, #1a0510 100%)",
  default: "linear-gradient(135deg, #0f0f0f 0%, #1f1f1f 50%, #0f0f0f 100%)",
};

function formatViews(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return Math.floor(n / 1_000) + "K";
  return String(n);
}

function timeAgo(ts: number) {
  const diff = (Date.now() - ts) / 1000;
  if (diff < 60) return "Just now";
  if (diff < 3600) return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  if (diff < 604800) return Math.floor(diff / 86400) + "d ago";
  return Math.floor(diff / 604800) + "w ago";
}

interface VideoCardProps {
  video: VideoItem;
  onWatch: (video: VideoItem) => void;
  compact?: boolean;
}

export default function VideoCard({ video, onWatch, compact = false }: VideoCardProps) {
  const grad = GRADIENTS[video.type?.toLowerCase()] || GRADIENTS.default;
  const domain = (() => { try { return new URL(video.extractedFrom || "").hostname.replace("www.", ""); } catch { return video.source || "unknown"; } })();

  if (compact) {
    return (
      <div
        onClick={() => onWatch(video)}
        className="flex gap-3 cursor-pointer group rounded"
        style={{ padding: "6px 0" }}
      >
        <div
          className="relative flex-shrink-0 rounded overflow-hidden flex items-center justify-center"
          style={{ width: 120, aspectRatio: "16/9", background: grad }}
        >
          <Film size={16} style={{ color: "rgba(255,255,255,0.15)" }} />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: "rgba(0,0,0,0.5)" }}>
            <Play size={18} className="text-white fill-white" />
          </div>
          <span
            className="absolute bottom-1 right-1 text-white font-bold"
            style={{ background: "rgba(0,0,0,0.8)", fontSize: 9, padding: "1px 4px", borderRadius: 2 }}
          >
            {video.type?.toUpperCase() || "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0 py-0.5">
          <p
            className="font-semibold leading-snug line-clamp-2 group-hover:text-[#f30] transition-colors"
            style={{ fontSize: 13, color: "#ddd" }}
          >
            {video.title}
          </p>
          <p className="text-xs mt-1 truncate" style={{ color: "#666" }}>{domain}</p>
          <p className="text-xs mt-0.5" style={{ color: "#555" }}>{formatViews(video.views || 0)} views · {timeAgo(video.extractedAt)}</p>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onWatch(video)} className="cursor-pointer group">
      <div
        className="relative w-full rounded overflow-hidden flex items-center justify-center"
        style={{ aspectRatio: "16/9", background: grad }}
      >
        <Film size={40} style={{ color: "rgba(255,255,255,0.08)" }} />
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "rgba(0,0,0,0.55)" }}
        >
          <div className="w-14 h-14 flex items-center justify-center rounded-full" style={{ background: "rgba(255,51,0,0.9)" }}>
            <Play size={22} className="text-white fill-white ml-0.5" />
          </div>
        </div>
        <span
          className="absolute top-2 left-2 font-bold text-white"
          style={{ background: "#f30", fontSize: 10, padding: "2px 6px", borderRadius: 2 }}
        >
          {video.type?.toUpperCase() || "VID"}
        </span>
        <span
          className="absolute bottom-2 right-2 text-white font-bold"
          style={{ background: "rgba(0,0,0,0.8)", fontSize: 10, padding: "2px 5px", borderRadius: 2 }}
        >
          {video.duration || "—"}
        </span>
        <div
          className="absolute inset-x-0 bottom-0 h-8 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
        />
      </div>
      <div className="pt-2 pb-1 px-0.5">
        <h3
          className="font-semibold leading-snug line-clamp-2 group-hover:text-[#f30] transition-colors"
          style={{ fontSize: 13, color: "#e0e0e0" }}
        >
          {video.title}
        </h3>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs truncate" style={{ color: "#777", maxWidth: "70%" }}>{domain}</span>
          <span className="text-xs" style={{ color: "#555" }}>{formatViews(video.views || 0)}</span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: "#555" }}>{timeAgo(video.extractedAt)}</p>
      </div>
    </div>
  );
}
