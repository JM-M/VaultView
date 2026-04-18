export interface AudioMeta {
  duration: number;
}

export function extractAudioMetadata(file: File): Promise<AudioMeta> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement("audio");
    const url = URL.createObjectURL(file);
    audio.src = url;

    const cleanup = () => {
      URL.revokeObjectURL(url);
      audio.removeAttribute("src");
      audio.load();
    };

    audio.onerror = () => {
      cleanup();
      reject(new Error("Failed to load audio"));
    };

    audio.onloadedmetadata = () => {
      const { duration } = audio;
      cleanup();
      resolve({ duration });
    };
  });
}
