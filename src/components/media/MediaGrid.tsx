import { useRef, useMemo, useCallback } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useStore } from "@/store";
import { MediaCard } from "./MediaCard";
import { FilterBar } from "./FilterBar";
import type { FileRecord } from "@/db";

export function MediaGrid() {
  const files = useStore((s) => s.files);
  const filters = useStore((s) => s.filters);
  const gridSize = useStore((s) => s.gridSize);
  const setSelectedFile = useStore((s) => s.setSelectedFile);
  const openViewer = useStore((s) => s.openViewer);

  const containerRef = useRef<HTMLDivElement>(null);

  // Filter files
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

  // Compute grid layout
  const gap = 8;
  const cardHeight = gridSize + 32;
  const containerWidth = containerRef.current?.clientWidth ?? 1200;
  const columns = Math.max(1, Math.floor((containerWidth + gap) / (gridSize + gap)));
  const rowCount = Math.ceil(filteredFiles.length / columns);

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => containerRef.current,
    estimateSize: () => cardHeight + gap,
    overscan: 3,
  });

  const handleCardClick = useCallback(
    (file: FileRecord, index: number) => {
      setSelectedFile(file, index);
      openViewer();
    },
    [setSelectedFile, openViewer],
  );

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <FilterBar />

      {filteredFiles.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-[var(--color-text-muted)]">
          No files to display
        </div>
      ) : (
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto px-4 pb-4"
        >
          <div
            style={{
              height: virtualizer.getTotalSize(),
              position: "relative",
            }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const startIndex = virtualRow.index * columns;
              const rowFiles = filteredFiles.slice(
                startIndex,
                startIndex + columns,
              );

              return (
                <div
                  key={virtualRow.key}
                  style={{
                    position: "absolute",
                    top: virtualRow.start,
                    left: 0,
                    display: "flex",
                    gap,
                  }}
                >
                  {rowFiles.map((file, colIndex) => (
                    <MediaCard
                      key={file.id}
                      file={file}
                      size={gridSize}
                      onClick={() =>
                        handleCardClick(file, startIndex + colIndex)
                      }
                    />
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
