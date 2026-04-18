import { useRef, useState } from "react";

interface VideoPlayerProps {
  src: string;
}

const SPEEDS = [0.5, 1, 1.5, 2];

export function VideoPlayer({ src }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [speed, setSpeed] = useState(1);

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    if (videoRef.current) {
      videoRef.current.playbackRate = newSpeed;
    }
  };

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3">
      <video
        ref={videoRef}
        src={src}
        controls
        autoPlay
        className="max-h-[calc(100%-48px)] max-w-full"
      />
      <div className="flex items-center gap-2">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => handleSpeedChange(s)}
            className={`rounded px-2 py-0.5 text-xs font-medium transition-colors ${
              speed === s
                ? "bg-blue-500 text-white"
                : "text-[var(--color-text-muted)] hover:text-white"
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
