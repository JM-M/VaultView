import { useStore } from "@/store";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SearchBar } from "./SearchBar";
import { SortControls } from "./SortControls";

interface ToolbarProps {
  onOpenSettings: () => void;
}

export function Toolbar({ onOpenSettings }: ToolbarProps) {
  const isScanning = useStore((s) => s.isScanning);
  const progress = useStore((s) => s.progress);
  const folders = useStore((s) => s.folders);
  const activeFolderId = useStore((s) => s.activeFolderId);
  const files = useStore((s) => s.files);
  const gridSize = useStore((s) => s.gridSize);
  const setGridSize = useStore((s) => s.setGridSize);
  const toggleSidebar = useStore((s) => s.toggleSidebar);

  const activeFolder = folders.find((f) => f.id === activeFolderId);

  return (
    <header className="flex flex-col border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="flex items-center gap-3 px-4 py-2">
        <button
          onClick={toggleSidebar}
          className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          title="Toggle sidebar"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        <h1 className="text-sm font-bold text-blue-400">VaultView</h1>

        {activeFolder && (
          <>
            <span className="text-[var(--color-text-muted)]">/</span>
            <span className="text-sm font-medium">{activeFolder.name}</span>
            <span className="text-xs text-[var(--color-text-muted)]">
              {files.length} files
            </span>
          </>
        )}

        <div className="flex-1" />

        {activeFolderId && <SortControls />}
        {activeFolderId && <SearchBar />}

        <label className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
          Size
          <input
            type="range"
            min={100}
            max={400}
            step={50}
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value))}
            className="w-20"
          />
        </label>

        <button
          onClick={onOpenSettings}
          className="rounded p-1 text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          title="Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      {isScanning && (
        <div className="px-4 pb-2">
          <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span>
              Scanning {progress.currentDir}... ({progress.processed}/{progress.total})
            </span>
          </div>
          <ProgressBar value={progress.processed} max={progress.total} />
        </div>
      )}
    </header>
  );
}
