import { useCallback } from "react";
import { useStore } from "@/store";
import { sortFiles } from "@/services/sort-bridge";
import type { SortBy, SortDir } from "@/store/ui-slice";

const sortOptions: Array<{ label: string; value: SortBy }> = [
  { label: "Name", value: "name" },
  { label: "Date", value: "modified" },
  { label: "Size", value: "size" },
  { label: "Type", value: "mediaType" },
];

export function SortControls() {
  const sortBy = useStore((s) => s.sortBy);
  const sortDir = useStore((s) => s.sortDir);
  const setSort = useStore((s) => s.setSort);
  const files = useStore((s) => s.files);
  const setFiles = useStore((s) => s.setFiles);

  const handleSort = useCallback(
    async (by: SortBy) => {
      const newDir: SortDir =
        by === sortBy ? (sortDir === "asc" ? "desc" : "asc") : "asc";
      setSort(by, newDir);
      const sorted = await sortFiles(files, by, newDir);
      setFiles(sorted);
    },
    [sortBy, sortDir, files, setSort, setFiles],
  );

  return (
    <div className="flex items-center gap-1">
      {sortOptions.map((opt) => (
        <button
          key={opt.value}
          onClick={() => handleSort(opt.value)}
          className={`rounded px-2 py-1 text-xs font-medium transition-colors ${
            sortBy === opt.value
              ? "bg-blue-500/15 text-blue-400"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          {opt.label}
          {sortBy === opt.value && (
            <span className="ml-0.5">{sortDir === "asc" ? "↑" : "↓"}</span>
          )}
        </button>
      ))}
    </div>
  );
}
