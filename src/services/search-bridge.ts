type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
};

let worker: Worker | null = null;
let msgId = 0;
const pending = new Map<string, PendingRequest>();

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker(
      new URL("../workers/search.worker.ts", import.meta.url),
      { type: "module" },
    );
    worker.onmessage = (e) => {
      const { id } = e.data;
      const req = pending.get(id);
      if (req) {
        pending.delete(id);
        req.resolve(e.data);
      }
    };
  }
  return worker;
}

function send(message: Record<string, unknown>): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const id = String(++msgId);
    pending.set(id, { resolve, reject });
    getWorker().postMessage({ ...message, id });
  });
}

export async function indexFiles(
  files: Array<{ id: string; name: string }>,
): Promise<void> {
  await send({ type: "index", files });
}

export async function searchFiles(query: string): Promise<string[]> {
  const result = (await send({ type: "search", query })) as {
    results: string[];
  };
  return result.results;
}

export async function removeFromIndex(fileIds: string[]): Promise<void> {
  await send({ type: "remove", fileIds });
}

export async function clearIndex(): Promise<void> {
  await send({ type: "clear" });
}
