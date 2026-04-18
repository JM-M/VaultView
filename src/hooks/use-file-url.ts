import { useEffect, useState } from "react";
import type { FileRecord, FolderRecord } from "@/db";
import { getFileFromRecord } from "@/services/file-access";

/**
 * Loads the original file as an object URL for the viewer.
 * Revokes the URL on unmount or when file changes.
 */
export function useFileUrl(
  file: FileRecord | null,
  folder: FolderRecord | null,
): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file || !folder) {
      setUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl: string | null = null;

    getFileFromRecord(file, folder.handle)
      .then((f) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(f);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [file?.id, folder?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return url;
}
