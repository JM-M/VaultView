import type { FileRecord } from "@/db";

/**
 * Retrieve the original File object by walking the folder handle
 * using the stored relative path.
 */
export async function getFileFromRecord(
  record: FileRecord,
  folderHandle: FileSystemDirectoryHandle,
): Promise<File> {
  const segments = record.path.split("/");
  const fileName = segments.pop()!;

  let dirHandle = folderHandle;
  for (const segment of segments) {
    dirHandle = await dirHandle.getDirectoryHandle(segment);
  }

  const fileHandle = await dirHandle.getFileHandle(fileName);
  return fileHandle.getFile();
}
