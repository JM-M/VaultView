import { useStore } from "@/store";
import { Button } from "@/components/ui/Button";
import { db } from "@/db";
import { clearAllThumbs } from "@/services/thumb-cache";
import { thumbLRU } from "@/services/thumb-lru";

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const theme = useStore((s) => s.theme);
  const toggleTheme = useStore((s) => s.toggleTheme);

  const handleClearData = async () => {
    if (!confirm("This will delete all indexed data and thumbnails. Continue?"))
      return;
    await db.files.clear();
    await db.folders.clear();
    await clearAllThumbs();
    thumbLRU.clear();
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="w-80 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <Button variant="ghost" onClick={toggleTheme} className="text-xs">
              {theme === "dark" ? "Dark" : "Light"}
            </Button>
          </div>

          <div className="border-t border-[var(--color-border)] pt-4">
            <Button
              variant="secondary"
              onClick={handleClearData}
              className="w-full text-red-400"
            >
              Clear All Data
            </Button>
          </div>

          <p className="text-center text-[10px] text-[var(--color-text-muted)]">
            VaultView v0.1.0
          </p>
        </div>
      </div>
    </div>
  );
}
