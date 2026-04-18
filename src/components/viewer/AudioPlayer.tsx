import { MediaTypeIcon } from "@/components/media/MediaTypeIcon";

interface AudioPlayerProps {
  src: string;
  fileName: string;
}

export function AudioPlayer({ src, fileName }: AudioPlayerProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-6">
      <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-[var(--color-surface)] text-[var(--color-text-muted)]">
        <MediaTypeIcon type="audio" size={64} />
      </div>
      <p className="max-w-md truncate text-sm font-medium text-white">
        {fileName}
      </p>
      <audio src={src} controls autoPlay className="w-full max-w-md" />
    </div>
  );
}
