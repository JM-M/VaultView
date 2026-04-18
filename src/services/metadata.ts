import type { FileRecord } from "@/db";
import { captureVideoThumb } from "./video-thumbnailer";
import { extractAudioMetadata } from "./audio-metadata";

export interface MetadataResult {
  width?: number;
  height?: number;
  duration?: number;
  thumbBlob?: Blob;
}

export async function extractMetadata(
  record: FileRecord,
  file: File,
): Promise<MetadataResult> {
  switch (record.mediaType) {
    case "image": {
      try {
        const bitmap = await createImageBitmap(file);
        const { width, height } = bitmap;
        bitmap.close();
        return { width, height };
      } catch {
        return {};
      }
    }
    case "video": {
      try {
        const result = await captureVideoThumb(file);
        return {
          width: result.width,
          height: result.height,
          duration: result.duration,
          thumbBlob: result.blob,
        };
      } catch {
        return {};
      }
    }
    case "audio": {
      try {
        const meta = await extractAudioMetadata(file);
        return { duration: meta.duration };
      } catch {
        return {};
      }
    }
    default:
      return {};
  }
}
