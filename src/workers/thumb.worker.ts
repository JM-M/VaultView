const THUMB_MAX_SIZE = 480;

interface ThumbRequest {
  id: string;
  fileId: string;
  file: File;
}

interface ThumbResponse {
  id: string;
  fileId: string;
  blob: Blob;
  width: number;
  height: number;
}

self.onmessage = async (e: MessageEvent<ThumbRequest>) => {
  const { id, fileId, file } = e.data;

  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;

    // Compute scaled dimensions
    const scale = Math.min(THUMB_MAX_SIZE / width, THUMB_MAX_SIZE / height, 1);
    const thumbWidth = Math.round(width * scale);
    const thumbHeight = Math.round(height * scale);

    const canvas = new OffscreenCanvas(thumbWidth, thumbHeight);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(bitmap, 0, 0, thumbWidth, thumbHeight);
    bitmap.close();

    const blob = await canvas.convertToBlob({
      type: "image/webp",
      quality: 0.85,
    });

    const response: ThumbResponse = { id, fileId, blob, width, height };
    self.postMessage(response);
  } catch {
    // Post error response
    self.postMessage({ id, fileId, error: true });
  }
};
