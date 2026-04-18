import { useState, useRef, useCallback, useEffect } from "react";
import { useSearch } from "@/hooks/use-search";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const { search, clearSearch } = useSearch();
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const handleChange = useCallback(
    (value: string) => {
      setQuery(value);
      clearTimeout(timerRef.current);
      if (!value.trim()) {
        clearSearch();
        return;
      }
      timerRef.current = setTimeout(() => {
        search(value);
      }, 150);
    },
    [search, clearSearch],
  );

  const handleClear = useCallback(() => {
    setQuery("");
    clearSearch();
  }, [clearSearch]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClear();
        (e.target as HTMLInputElement).blur();
      }
    },
    [handleClear],
  );

  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div className="relative">
      <svg
        className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search files..."
        className="w-48 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] py-1.5 pl-8 pr-7 text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:border-blue-500 focus:outline-none"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
