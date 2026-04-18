import type { FileRecord } from "@/db";

export interface DeltaResult {
  added: string[];
  modified: string[];
  deleted: string[];
  unchanged: string[];
}

/**
 * Compare discovered files against existing DB entries to determine
 * which files need processing, updating, or removal.
 */
export function computeDelta(
  discoveredFiles: Map<string, { modified: number }>,
  existingFiles: FileRecord[],
): DeltaResult {
  const existingByPath = new Map<string, FileRecord>();
  for (const f of existingFiles) {
    existingByPath.set(f.path, f);
  }

  const added: string[] = [];
  const modified: string[] = [];
  const unchanged: string[] = [];

  for (const [path, info] of discoveredFiles) {
    const existing = existingByPath.get(path);
    if (!existing) {
      added.push(path);
    } else if (existing.modified !== info.modified) {
      modified.push(path);
    } else {
      unchanged.push(path);
    }
  }

  const deleted: string[] = [];
  for (const f of existingFiles) {
    if (!discoveredFiles.has(f.path)) {
      deleted.push(f.path);
    }
  }

  return { added, modified, deleted, unchanged };
}
