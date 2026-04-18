import { useCallback, useMemo } from "react";
import { useStore } from "@/store";
import { useKeyboardNav } from "@/hooks/use-keyboard-nav";
import { useFileUrl } from "@/hooks/use-file-url";
import { ImageViewer } from "./ImageViewer";
import { VideoPlayer } from "./VideoPlayer";
import { AudioPlayer } from "./AudioPlayer";

export function ViewerModal() {
  const viewerOpen = useStore((s) => s.viewerOpen);
  const closeViewer = useStore((s) => s.closeViewer);
  const selectedFile = useStore((s) => s.selectedFile);
  const selectedIndex = useStore((s) => s.selectedIndex);
  const files = useStore((s) => s.files);
  const filters = useStore((s) => s.filters);
  const setSelectedFile = useStore((s) => s.setSelectedFile);
  const folders = useStore((s) => s.folders);
  const activeFolderId = useStore((s) => s.activeFolderId);

  const activeFolder = folders.find((f) => f.id === activeFolderId) ?? null;
  const fileUrl = useFileUrl(viewerOpen ? selectedFile : null, activeFolder);

  // Filtered file list for navigation
  const filteredFiles = useMemo(() => {
    let result = files;
    if (filters.mediaType) {
      result = result.filter((f) => f.mediaType === filters.mediaType);
    }
    if (filters.searchResultIds) {
      result = result.filter((f) => filters.searchResultIds!.has(f.id));
    }
    return result;
  }, [files, filters.mediaType, filters.searchResultIds]);

  const navigate = useCallback(
    (delta: number) => {
      const currentIdx = selectedIndex >= 0
        ? selectedIndex
        : filteredFiles.findIndex((f) => f.id === selectedFile?.id);
      const newIdx = currentIdx + delta;
      if (newIdx >= 0 && newIdx < filteredFiles.length) {
        setSelectedFile(filteredFiles[newIdx]!, newIdx);
      }
    },
    [filteredFiles, selectedIndex, selectedFile, setSelectedFile],
  );

  const handleClose = useCallback(() => {
    closeViewer();
    setSelectedFile(null);
  }, [closeViewer, setSelectedFile]);

  useKeyboardNav({
    onPrev: () => navigate(-1),
    onNext: () => navigate(1),
    onClose: handleClose,
    enabled: viewerOpen,
  });

  if (!viewerOpen || !selectedFile) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/90"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2">
        <span className="truncate text-sm text-white/70">
          {selectedFile.name}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="rounded p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            title="Previous"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={() => navigate(1)}
            className="rounded p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            title="Next"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="rounded p-1.5 text-white/50 hover:bg-white/10 hover:text-white"
            title="Close (Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-4 pb-4">
        {!fileUrl ? (
          <div className="flex h-full items-center justify-center text-white/50">
            Loading...
          </div>
        ) : selectedFile.mediaType === "image" ? (
          <ImageViewer src={fileUrl} />
        ) : selectedFile.mediaType === "video" ? (
          <VideoPlayer src={fileUrl} />
        ) : selectedFile.mediaType === "audio" ? (
          <AudioPlayer src={fileUrl} fileName={selectedFile.name} />
        ) : (
          <div className="flex h-full items-center justify-center text-white/50">
            Preview not available
          </div>
        )}
      </div>
    </div>
  );
}
