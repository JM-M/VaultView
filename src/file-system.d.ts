interface FileSystemDirectoryHandle {
  values(): AsyncIterableIterator<FileSystemHandle>;
  queryPermission(descriptor?: { mode?: string }): Promise<string>;
  requestPermission(descriptor?: { mode?: string }): Promise<string>;
}

interface Window {
  showDirectoryPicker(): Promise<FileSystemDirectoryHandle>;
}
