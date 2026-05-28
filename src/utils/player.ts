const DIRECT_VIDEO_EXTS = [".mp4", ".webm", ".m3u8", ".mov", ".mkv", ".avi", ".ogv", ".flv", ".mpd"];

export function isEmbedUrl(url: string): boolean {
  try {
    const lower = url.toLowerCase().split("?")[0];
    return !DIRECT_VIDEO_EXTS.some((ext) => lower.endsWith(ext));
  } catch {
    return false;
  }
}
