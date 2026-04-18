import { useCallback } from "react";
import { useStore } from "@/store";
import { db } from "@/db";
import { scanFolder } from "@/services/scanner";

export function useScan() {
  const addFiles = useStore((s) => s.addFiles);
  const setFiles = useStore((s) => s.setFiles);
  const startScan = useStore((s) => s.startScan);
  const updateProgress = useStore((s) => s.updateProgress);
  const endScan = useStore((s) => s.endScan);
  const updateFolderScanTime = useStore((s) => s.updateFolderScanTime);
  const isScanning = useStore((s) => s.isScanning);

  const scan = useCallback(
    async (folderId: string, handle: FileSystemDirectoryHandle) => {
      if (isScanning) return;

      startScan();

      // Load existing files for this folder into state
      const existingFiles = await db.files
        .where("folderId")
        .equals(folderId)
        .toArray();
      setFiles(existingFiles);

      // Clear existing files for a fresh scan
      // (delta scan can be added later for optimization)
      await db.files.where("folderId").equals(folderId).delete();
      setFiles([]);

      try {
        await scanFolder(
          folderId,
          handle,
          async (batch) => {
            await db.files.bulkPut(batch);
            addFiles(batch);
          },
          (progress) => {
            updateProgress(progress);
          },
        );

        await updateFolderScanTime(folderId);
      } finally {
        endScan();
      }
    },
    [isScanning, startScan, setFiles, addFiles, updateProgress, endScan, updateFolderScanTime],
  );

  return { scan, isScanning };
}
