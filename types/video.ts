import type { WatermarkSettings } from "./watermark"

export interface VideoItem {
  id: string;
  file: File;
  name: string;
  duration: number;
  size: number;
  thumbnail?: string;
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
  errorMessage?: string;
  customSettings?: WatermarkSettings;
  outputUrl?: string;
}

export interface VideoProcessingOptions {
  watermarkSettings: WatermarkSettings;
  outputFormat: 'mp4' | 'webm';
  quality: 'high' | 'medium' | 'low';
  frameRate?: number;
  startTime?: number;
  endTime?: number;
  resolution?: {
    width: number;
    height: number;
  };
}

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska"
] as const;

export type AcceptedVideoType = typeof ACCEPTED_VIDEO_TYPES[number];

export const VIDEO_MIME_TYPES: Record<string, string> = {
  'mp4': 'video/mp4',
  'webm': 'video/webm',
  'mov': 'video/quicktime',
  'avi': 'video/x-msvideo',
  'mkv': 'video/x-matroska'
};

export const VIDEO_EXTENSIONS = Object.keys(VIDEO_MIME_TYPES);
