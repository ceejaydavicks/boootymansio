import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { isEmbedUrl } from "../utils/player";

interface VideoPlayerProps {
  url: string;
  thumbnail?: string;
  title?: string;
}

export default function VideoPlayer({ url, thumbnail, title }: VideoPlayerProps) {
  const [launched, setLaunched] = useState(false);
  const embed = isEmbedUrl(url);

  if (!embed) {
    return (
      <video
        key={url}
        src={url}
        controls
        autoPlay
        className="w-full h-full"
        style={{ display: "block" }}
      />
    );
  }

  if (!launched) {
    return (
      <div className="relative w-full h-full flex items-center justify-center" style={{ background: "#000" }}>
        {thumbnail && (
          <img
            src={thumbnail}
            alt={title || "Video thumbnail"}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ opacity: 0.65 }}
          />
        )}
        <div className="relative z-10 flex flex-col items-center gap-4">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setLaunched(true)}
            className="flex items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
            style={{ width: 80, height: 80, background: "rgba(255,51,0,0.92)", boxShadow: "0 0 40px rgba(255,51,0,0.5)" }}
          >
            <Play size={32} className="text-white fill-white ml-1" />
          </a>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setLaunched(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ background: "rgba(0,0,0,0.7)", border: "1px solid rgba(255,255,255,0.2)" }}
          >
            <ExternalLink size={14} /> Watch on source site
          </a>
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)" }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center gap-4" style={{ background: "#0a0a0a" }}>
      {thumbnail && (
        <img
          src={thumbnail}
          alt={title || "Video thumbnail"}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.15 }}
        />
      )}
      <p className="relative z-10 text-sm font-semibold text-white">Video opened in new tab</p>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative z-10 flex items-center gap-2 px-5 py-2 rounded text-sm font-semibold transition-opacity hover:opacity-80"
        style={{ background: "#f30", color: "#fff" }}
      >
        <ExternalLink size={14} /> Open again
      </a>
    </div>
  );
}
