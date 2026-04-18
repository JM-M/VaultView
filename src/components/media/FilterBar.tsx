import { useStore } from "@/store";
import type { MediaType } from "@/db";

const filters: Array<{ label: string; value: MediaType | null }> = [
  { label: "All", value: null },
  { label: "Images", value: "image" },
  { label: "Videos", value: "video" },
  { label: "Audio", value: "audio" },
];

export function FilterBar() {
  const currentFilter = useStore((s) => s.filters.mediaType);
  const setMediaTypeFilter = useStore((s) => s.setMediaTypeFilter);

  return (
    <div className="flex items-center gap-1 px-4 py-2">
      {filters.map((f) => (
        <button
          key={f.label}
          onClick={() => setMediaTypeFilter(f.value)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            currentFilter === f.value
              ? "bg-blue-500 text-white"
              : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text)]"
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
