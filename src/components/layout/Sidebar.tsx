import { useStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { useScan } from "@/hooks/use-scan";
import { useThumbnails } from "@/hooks/use-thumbnails";
import { db } from "@/db";
import type { FileRecord } from "@/db";
import { useEffect, useRef } from "react";

export function Sidebar() {
  const folders = useStore((s) => s.folders);
  const activeFolderId = useStore((s) => s.activeFolderId);
  const addFolder = useStore((s) => s.addFolder);
  const removeFolder = useStore((s) => s.removeFolder);
  const setActiveFolder = useStore((s) => s.setActiveFolder);
  const setFiles = useStore((s) => s.setFiles);
  const sidebarOpen = useStore((s) => s.sidebarOpen);
  const { scan, isScanning } = useScan();
  const { processBatch } = useThumbnails();
  const pendingBatchesRef = useRef<FileRecord[][]>([]);

  // Process thumbnail batches after scan
  const isProcessingThumbs = useRef(false);

  useEffect(() => {
    if (isScanning || pendingBatchesRef.current.length === 0 || isProcessingThumbs.current) return;
    isProcessingThumbs.current = true;
    const batches = pendingBatchesRef.current;
    pendingBatchesRef.current = [];
    const allFiles = batches.flat();
    processBatch(allFiles).finally(() => {
      isProcessingThumbs.current = false;
    });
  }, [isScanning, processBatch]);

  const handleAddFolder = async () => {
    try {
      const handle = await window.showDirectoryPicker();
      const folder = await addFolder(handle);
      setActiveFolder(folder.id);
      pendingBatchesRef.current = [];
      await scan(folder.id, handle);
      // After scan, load all files and process thumbs
      const allFiles = await db.files
        .where("folderId")
        .equals(folder.id)
        .toArray();
      processBatch(allFiles);
    } catch {
      // User cancelled picker
    }
  };

  const handleSelectFolder = async (folderId: string) => {
    setActiveFolder(folderId);
    const folder = folders.find((f) => f.id === folderId);
    if (!folder) return;

    // Check permission
    const permission = await folder.handle.queryPermission({ mode: "read" });
    if (permission !== "granted") {
      const requested = await folder.handle.requestPermission({ mode: "read" });
      if (requested !== "granted") return;
    }

    // Load files from DB
    const files = await db.files
      .where("folderId")
      .equals(folderId)
      .toArray();
    setFiles(files);
  };

  const handleRemoveFolder = async (e: React.MouseEvent, folderId: string) => {
    e.stopPropagation();
    await removeFolder(folderId);
  };

  const handleRescan = async () => {
    const folder = folders.find((f) => f.id === activeFolderId);
    if (!folder || isScanning) return;

    await scan(folder.id, folder.handle);
    const allFiles = await db.files
      .where("folderId")
      .equals(folder.id)
      .toArray();
    processBatch(allFiles);
  };

  if (!sidebarOpen) return null;

  return (
    <aside className="flex h-full w-60 flex-shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center justify-between border-b border-[var(--color-border)] p-3">
        <span className="text-sm font-semibold">Folders</span>
        <Button variant="primary" onClick={handleAddFolder} disabled={isScanning}>
          + Add
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        {folders.length === 0 && (
          <p className="px-2 py-4 text-center text-xs text-[var(--color-text-muted)]">
            No folders added yet
          </p>
        )}
        {folders.map((folder) => (
          <button
            key={folder.id}
            onClick={() => handleSelectFolder(folder.id)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              activeFolderId === folder.id
                ? "bg-blue-500/10 text-blue-400"
                : "text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]"
            }`}
          >
            <span className="truncate">{folder.name}</span>
            <button
              onClick={(e) => handleRemoveFolder(e, folder.id)}
              className="ml-2 flex-shrink-0 rounded p-0.5 text-[var(--color-text-muted)] hover:bg-red-500/20 hover:text-red-400"
              title="Remove folder"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </button>
        ))}
      </nav>

      {activeFolderId && (
        <div className="border-t border-[var(--color-border)] p-2">
          <Button
            variant="ghost"
            className="w-full text-xs"
            onClick={handleRescan}
            disabled={isScanning}
          >
            {isScanning ? "Scanning..." : "Rescan"}
          </Button>
        </div>
      )}
    </aside>
  );
}
