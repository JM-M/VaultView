import type { MediaType } from "@/db";

export function generateId(): string {
  return crypto.randomUUID();
}

const IMAGE_EXTS = new Set([
  "jpg", "jpeg", "png", "webp", "gif", "avif", "bmp",
]);

const VIDEO_EXTS = new Set([
  "mp4", "mkv", "webm", "mov", "avi",
]);

const AUDIO_EXTS = new Set([
  "mp3", "wav", "flac", "m4a", "ogg", "aac",
]);

export function classifyMediaType(ext: string): MediaType {
  const lower = ext.toLowerCase();
  if (IMAGE_EXTS.has(lower)) return "image";
  if (VIDEO_EXTS.has(lower)) return "video";
  if (AUDIO_EXTS.has(lower)) return "audio";
  return "other";
}

export function isSupported(ext: string): boolean {
  return classifyMediaType(ext) !== "other";
}

export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return "";
  return filename.slice(dot + 1).toLowerCase();
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
