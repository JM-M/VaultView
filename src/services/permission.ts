export async function checkPermission(
  handle: FileSystemDirectoryHandle,
): Promise<"granted" | "denied" | "prompt"> {
  try {
    const result = await handle.queryPermission({ mode: "read" });
    return result as "granted" | "denied" | "prompt";
  } catch {
    return "denied";
  }
}

export async function requestPermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  try {
    const result = await handle.requestPermission({ mode: "read" });
    return result === "granted";
  } catch {
    return false;
  }
}
