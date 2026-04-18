import { useEffect, useRef, useCallback } from "react";
import { useStore } from "@/store";
import { indexFiles, searchFiles, clearIndex } from "@/services/search-bridge";

export function useSearch() {
  const files = useStore((s) => s.files);
  const setSearchFilter = useStore((s) => s.setSearchFilter);
  const lastIndexedCount = useRef(0);

  // Index files when they change
  useEffect(() => {
    if (files.length === 0) {
      clearIndex();
      lastIndexedCount.current = 0;
      return;
    }

    // Only index new files (incremental)
    if (files.length > lastIndexedCount.current) {
      const newFiles = files.slice(lastIndexedCount.current);
      indexFiles(newFiles.map((f) => ({ id: f.id, name: f.name })));
      lastIndexedCount.current = files.length;
    } else if (files.length < lastIndexedCount.current) {
      // Files were removed, re-index all
      clearIndex().then(() => {
        indexFiles(files.map((f) => ({ id: f.id, name: f.name })));
        lastIndexedCount.current = files.length;
      });
    }
  }, [files]);

  const search = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchFilter("", null);
        return;
      }
      const ids = await searchFiles(query);
      setSearchFilter(query, new Set(ids));
    },
    [setSearchFilter],
  );

  const clearSearch = useCallback(() => {
    setSearchFilter("", null);
  }, [setSearchFilter]);

  return { search, clearSearch };
}
