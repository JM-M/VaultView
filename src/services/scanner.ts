import type { FileRecord } from "@/db";
import { generateId, getExtension, classifyMediaType, isSupported } from "@/lib/utils";

const BATCH_SIZE = 100;

export interface ScanProgress {
  total: number;
  processed: number;
  currentDir: string;
}

export async function scanFolder(
  folderId: string,
  rootHandle: FileSystemDirectoryHandle,
  onBatch: (files: FileRecord[]) => void,
  onProgress: (progress: ScanProgress) => void,
): Promise<void> {
  const queue: { handle: FileSystemDirectoryHandle; path: string }[] = [
    { handle: rootHandle, path: "" },
  ];

  let batch: FileRecord[] = [];
  let total = 0;
  let processed = 0;

  while (queue.length > 0) {
    const entry = queue.shift()!;
    onProgress({ total, processed, currentDir: entry.path || rootHandle.name });

    for await (const child of entry.handle.values()) {
      if (child.kind === "directory") {
        const childPath = entry.path
          ? `${entry.path}/${child.name}`
          : child.name;
        queue.push({
          handle: child as FileSystemDirectoryHandle,
          path: childPath,
        });
      } else {
        total++;
        const ext = getExtension(child.name);
        if (!isSupported(ext)) {
          processed++;
          continue;
        }

        try {
          const fileHandle = child as FileSystemFileHandle;
          const file = await fileHandle.getFile();
          const filePath = entry.path
            ? `${entry.path}/${child.name}`
            : child.name;

          const record: FileRecord = {
            id: generateId(),
            folderId,
            path: filePath,
            name: child.name,
            ext,
            mediaType: classifyMediaType(ext),
            size: file.size,
            modified: file.lastModified,
            indexedAt: Date.now(),
          };

          batch.push(record);
          processed++;

          if (batch.length >= BATCH_SIZE) {
            onBatch(batch);
            onProgress({ total, processed, currentDir: entry.path || rootHandle.name });
            batch = [];
            // Yield to the main thread
            await new Promise((r) => setTimeout(r, 0));
          }
        } catch {
          // Skip files we can't read
          processed++;
        }
      }
    }
  }

  // Flush remaining batch
  if (batch.length > 0) {
    onBatch(batch);
  }

  onProgress({ total, processed, currentDir: "" });
}
