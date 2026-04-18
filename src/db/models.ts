export type MediaType = "image" | "video" | "audio" | "other";

export interface FolderRecord {
  id: string;
  name: string;
  handle: FileSystemDirectoryHandle;
  createdAt: number;
  lastScanAt: number;
}

export interface FileRecord {
  id: string;
  folderId: string;
  path: string;
  name: string;
  ext: string;
  mediaType: MediaType;
  size: number;
  modified: number;
  width?: number;
  height?: number;
  duration?: number;
  thumbKey?: string;
  indexedAt: number;
}
