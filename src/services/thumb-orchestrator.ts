import type { FileRecord } from "@/db";
import { db } from "@/db";
import { putThumb } from "./thumb-cache";
import { ConcurrencyQueue } from "./thumb-queue";
import { captureVideoThumb } from "./video-thumbnailer";
import { extractAudioMetadata } from "./audio-metadata";
import { generateId } from "@/lib/utils";

const imageQueue = new ConcurrencyQueue(4);
const videoQueue = new ConcurrencyQueue(2);

let thumbWorker: Worker | null = null;
let messageId = 0;
const pendingRequests = new Map<
  string,
  {
    resolve: (value: { blob: Blob; width: number; height: number }) => void;
    reject: (reason: unknown) => void;
  }
>();

function getThumbWorker(): Worker {
  if (!thumbWorker) {
    thumbWorker = new Worker(
      new URL("../workers/thumb.worker.ts", import.meta.url),
      { type: "module" },
    );
    thumbWorker.onmessage = (e) => {
      const { id, blob, width, height, error } = e.data;
      const pending = pendingRequests.get(id);
      if (!pending) return;
      pendingRequests.delete(id);
      if (error) {
        pending.reject(new Error("Thumb worker error"));
      } else {
        pending.resolve({ blob, width, height });
      }
    };
  }
  return thumbWorker;
}

function generateImageThumb(
  fileId: string,
  file: File,
): Promise<{ blob: Blob; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const id = String(++messageId);
    pendingRequests.set(id, { resolve, reject });
    getThumbWorker().postMessage({ id, fileId, file });
  });
}

export type ThumbReadyCallback = (
  fileId: string,
  updates: Partial<FileRecord>,
) => void;

export async function generateThumbnails(
  files: FileRecord[],
  getFile: (record: FileRecord) => Promise<File>,
  onThumbReady: ThumbReadyCallback,
): Promise<void> {
  const tasks = files.map((record) => {
    switch (record.mediaType) {
      case "image":
        return imageQueue.add(async () => {
          try {
            const file = await getFile(record);
            const { blob, width, height } = await generateImageThumb(
              record.id,
              file,
            );
            const thumbKey = generateId();
            await putThumb(thumbKey, blob);
            await db.files.update(record.id, { thumbKey, width, height });
            onThumbReady(record.id, { thumbKey, width, height });
          } catch {
            // Skip failed thumbnails
          }
        });

      case "video":
        return videoQueue.add(async () => {
          try {
            const file = await getFile(record);
            const result = await captureVideoThumb(file);
            const thumbKey = generateId();
            await putThumb(thumbKey, result.blob);
            await db.files.update(record.id, {
              thumbKey,
              width: result.width,
              height: result.height,
              duration: result.duration,
            });
            onThumbReady(record.id, {
              thumbKey,
              width: result.width,
              height: result.height,
              duration: result.duration,
            });
          } catch {
            // Skip failed thumbnails
          }
        });

      case "audio":
        return (async () => {
          try {
            const file = await getFile(record);
            const meta = await extractAudioMetadata(file);
            await db.files.update(record.id, { duration: meta.duration });
            onThumbReady(record.id, { duration: meta.duration });
          } catch {
            // Skip
          }
        })();

      default:
        return Promise.resolve();
    }
  });

  await Promise.allSettled(tasks);
}
