import type { FileRecord } from "@/db";

type PendingResolve = (value: FileRecord[]) => void;

let worker: Worker | null = null;
let msgId = 0;
const pending = new Map<string, PendingResolve>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/sort.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = (e) => {
      const { id, sorted } = e.data;
      const resolve = pending.get(id);
      if (resolve) {
        pending.delete(id);
        resolve(sorted);
      }
    };
  }
  return worker;
}

const WORKER_THRESHOLD = 1000;

export async function sortFiles(
  files: FileRecord[],
  sortBy: string,
  direction: "asc" | "desc",
): Promise<FileRecord[]> {
  if (files.length < WORKER_THRESHOLD) {
    return sortSync(files, sortBy, direction);
  }

  return new Promise((resolve) => {
    const id = String(++msgId);
    pending.set(id, resolve);
    getWorker().postMessage({ id, files, sortBy, direction });
  });
}

function sortSync(
  files: FileRecord[],
  sortBy: string,
  direction: "asc" | "desc",
): FileRecord[] {
  return [...files].sort((a, b) => {
    const aVal = a[sortBy as keyof FileRecord];
    const bVal = b[sortBy as keyof FileRecord];

    let cmp = 0;
    if (typeof aVal === "string" && typeof bVal === "string") {
      cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
    } else if (typeof aVal === "number" && typeof bVal === "number") {
      cmp = aVal - bVal;
    } else {
      cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
    }

    return direction === "asc" ? cmp : -cmp;
  });
}
