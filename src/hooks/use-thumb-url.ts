import { useEffect, useState } from "react";
import { thumbLRU } from "@/services/thumb-lru";
import { getThumb } from "@/services/thumb-cache";

export function useThumbUrl(thumbKey: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(() => {
    if (!thumbKey) return null;
    return thumbLRU.get(thumbKey) ?? null;
  });

  useEffect(() => {
    if (!thumbKey) {
      setUrl(null);
      return;
    }

    // Check LRU first
    const cached = thumbLRU.get(thumbKey);
    if (cached) {
      setUrl(cached);
      return;
    }

    // Load from Cache API
    let cancelled = false;
    getThumb(thumbKey).then((blob) => {
      if (cancelled || !blob) return;
      const objectUrl = URL.createObjectURL(blob);
      thumbLRU.set(thumbKey, objectUrl);
      setUrl(objectUrl);
    });

    return () => {
      cancelled = true;
    };
  }, [thumbKey]);

  return url;
}
