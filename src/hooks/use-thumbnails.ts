import { useCallback, useRef } from "react";
import { useStore } from "@/store";
import type { FileRecord, FolderRecord } from "@/db";
import { generateThumbnails } from "@/services/thumb-orchestrator";
import { getFileFromRecord } from "@/services/file-access";

export function useThumbnails() {
  const updateFile = useStore((s) => s.updateFile);
  const folders = useStore((s) => s.folders);
  const folderMapRef = useRef<Map<string, FolderRecord>>(new Map());

  // Keep folder map in sync
  folderMapRef.current = new Map(folders.map((f) => [f.id, f]));

  const processBatch = useCallback(
    async (files: FileRecord[]) => {
      const needsThumbs = files.filter(
        (f) => !f.thumbKey && (f.mediaType === "image" || f.mediaType === "video"),
      );
      const needsMeta = files.filter(
        (f) => f.mediaType === "audio" && f.duration === undefined,
      );

      const toProcess = [...needsThumbs, ...needsMeta];
      if (toProcess.length === 0) return;

      await generateThumbnails(
        toProcess,
        async (record) => {
          const folder = folderMapRef.current.get(record.folderId);
          if (!folder) throw new Error("Folder not found");
          return getFileFromRecord(record, folder.handle);
        },
        (fileId, updates) => {
          updateFile(fileId, updates);
        },
      );
    },
    [updateFile],
  );

  return { processBatch };
}
