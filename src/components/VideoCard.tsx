import { Play, Film } from "lucide-react";
import { VideoItem } from "../types";

const TYPE_COLORS: Record<string, string> = {
  mp4: "from-red-900 to-red-700",
  m3u8: "from-purple-900 to-purple-700",
  webm: "from-blue-900 to-blue-700",
  mov: "from-green-900 to-green-700",
  mpd: "from-orange-900 to-orange-700",
  default: "from-zinc-800 to-zinc-700",
};

interface VideoCardProps {
  video: VideoItem;
  onWatch: (video: VideoItem) => void;
  compact?: boolean;
}

export default function VideoCard({ video, onWatch, compact = false }: VideoCardProps) {
  const gradientClass = TYPE_COLORS[video.type?.toLowerCase()] || TYPE_COLORS.default;
  const filename = video.url.split("/").pop()?.split("?")[0] || "video";
  const displayTitle = video.title || filename;

  if (compact) {
    return (
      <div
        onClick={() => onWatch(video)}
        className="flex gap-3 cursor-pointer group hover:bg-white/5 rounded-xl p-2 transition-colors"
      >
        <div className={`relative flex-shrink-0 w-40 aspect-video rounded-lg overflow-hidden bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
          <Film size={20} className="text-white/40" />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <Play size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
          </div>
          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-bold px-1 py-0.5 rounded uppercase">
            {video.type || "?"}
          </span>
        </div>
        <div className="flex-1 min-w-0 py-1">
          <p className="text-[13px] font-medium text-white line-clamp-2 leading-snug">{displayTitle}</p>
          <p className="text-xs text-zinc-500 mt-1 truncate">{video.label}</p>
          <p className="text-xs text-zinc-600 truncate">{video.source}</p>
        </div>
      </div>
    );
  }

  return (
    <div onClick={() => onWatch(video)} className="cursor-pointer group">
      <div className={`relative w-full aspect-video rounded-xl overflow-hidden bg-gradient-to-br ${gradientClass} flex items-center justify-center mb-3`}>
        <Film size={36} className="text-white/20" />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-200">
            <Play size={24} className="text-white fill-white ml-1" />
          </div>
        </div>
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
          {video.type || "?"}
        </span>
        <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide">
          {video.label}
        </span>
      </div>
      <div className="flex gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-700 flex-shrink-0 flex items-center justify-center mt-0.5">
          <Film size={14} className="text-zinc-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-medium text-white line-clamp-2 leading-snug group-hover:text-red-400 transition-colors">
            {displayTitle}
          </h3>
          <p className="text-xs text-zinc-500 mt-1 truncate">{video.pageTitle || video.source}</p>
          <p className="text-xs text-zinc-600 truncate">{video.extractedFrom}</p>
        </div>
      </div>
    </div>
  );
}
