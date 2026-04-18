import { db } from "@/db";
import { log } from "@/lib/logger";

/**
 * Remove orphaned thumbnails from the Cache API
 * that no longer have a matching file in Dexie.
 */
export async function cleanupOrphanedThumbs(): Promise<number> {
  try {
    const cache = await caches.open("vaultview-thumbs");
    const keys = await cache.keys();
    const allThumbKeys = new Set(
      (await db.files.where("thumbKey").notEqual("").toArray()).map(
        (f) => f.thumbKey,
      ),
    );

    let removed = 0;
    for (const request of keys) {
      const url = new URL(request.url);
      const key = url.pathname.slice(1); // strip leading /
      if (!allThumbKeys.has(key)) {
        await cache.delete(request);
        removed++;
      }
    }

    if (removed > 0) {
      log.info(`Cleaned up ${removed} orphaned thumbnails`);
    }
    return removed;
  } catch (err) {
    log.error("Thumbnail cleanup failed:", err);
    return 0;
  }
}
