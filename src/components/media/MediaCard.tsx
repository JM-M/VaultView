import { memo } from "react";
import type { FileRecord } from "@/db";
import { useThumbUrl } from "@/hooks/use-thumb-url";
import { MediaTypeIcon } from "./MediaTypeIcon";
import { formatFileSize } from "@/lib/utils";

interface MediaCardProps {
  file: FileRecord;
  size: number;
  onClick: () => void;
}

export const MediaCard = memo(function MediaCard({
  file,
  size,
  onClick,
}: MediaCardProps) {
  const thumbUrl = useThumbUrl(file.thumbKey);

  return (
    <button
      onClick={onClick}
      className="group relative flex flex-col overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors hover:border-blue-500/50"
      style={{ width: size, height: size + 32 }}
    >
      <div
        className="flex items-center justify-center overflow-hidden bg-[var(--color-bg)]"
        style={{ width: size, height: size }}
      >
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt={file.name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-[var(--color-text-muted)]">
            <MediaTypeIcon type={file.mediaType} size={32} />
          </div>
        )}
      </div>

      {/* Media type badge */}
      {file.mediaType !== "other" && (
        <div className="absolute right-1.5 top-1.5 rounded bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
          <MediaTypeIcon type={file.mediaType} size={12} />
        </div>
      )}

      {/* File info */}
      <div className="flex w-full items-center gap-1 px-2 py-1">
        <span className="flex-1 truncate text-left text-xs text-[var(--color-text)]">
          {file.name}
        </span>
        <span className="flex-shrink-0 text-[10px] text-[var(--color-text-muted)]">
          {formatFileSize(file.size)}
        </span>
      </div>
    </button>
  );
});
