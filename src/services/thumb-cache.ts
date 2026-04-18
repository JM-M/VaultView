const CACHE_NAME = "vaultview-thumbs";

async function openCache(): Promise<Cache> {
  return caches.open(CACHE_NAME);
}

function keyToUrl(key: string): string {
  return `https://vaultview-thumb/${key}`;
}

export async function putThumb(key: string, blob: Blob): Promise<void> {
  const cache = await openCache();
  const response = new Response(blob, {
    headers: { "Content-Type": blob.type },
  });
  await cache.put(keyToUrl(key), response);
}

export async function getThumb(key: string): Promise<Blob | null> {
  const cache = await openCache();
  const response = await cache.match(keyToUrl(key));
  if (!response) return null;
  return response.blob();
}

export async function deleteThumb(key: string): Promise<boolean> {
  const cache = await openCache();
  return cache.delete(keyToUrl(key));
}

export async function clearAllThumbs(): Promise<boolean> {
  return caches.delete(CACHE_NAME);
}
