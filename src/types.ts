export interface VideoItem {
  id: string;
  shareId: string;
  url: string;
  type: string;
  label: string;
  source: string;
  title: string;
  extractedFrom?: string;
  pageTitle?: string;
  extractedAt: number;
  views?: number;
  duration?: string;
  thumbnail?: string;
}

export interface Thumbnail {
  url: string;
  timestamp: string;
}

export type Page = "home" | "watch" | "tools";
