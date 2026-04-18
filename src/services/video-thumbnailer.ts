const THUMB_MAX_SIZE = 480;

export interface VideoThumbResult {
  blob: Blob;
  width: number;
  height: number;
  duration: number;
}

export function captureVideoThumb(file: File): Promise<VideoThumbResult> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.playsInline = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error("Failed to load video"));
    };

    video.onloadedmetadata = () => {
      const { videoWidth: width, videoHeight: height, duration } = video;

      // Seek to 1 second or 10% of duration, whichever is smaller
      video.currentTime = Math.min(1, duration * 0.1);

      video.onseeked = () => {
        try {
          const scale = Math.min(
            THUMB_MAX_SIZE / width,
            THUMB_MAX_SIZE / height,
            1,
          );
          const thumbWidth = Math.round(width * scale);
          const thumbHeight = Math.round(height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = thumbWidth;
          canvas.height = thumbHeight;

          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);

          canvas.toBlob(
            (blob) => {
              cleanup();
              if (blob) {
                resolve({ blob, width, height, duration });
              } else {
                reject(new Error("Failed to create video thumbnail blob"));
              }
            },
            "image/webp",
            0.85,
          );
        } catch (err) {
          cleanup();
          reject(err);
        }
      };
    };
  });
}
