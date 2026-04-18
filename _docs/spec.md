# VaultView MVP — V2.1 Technical Specification
**CTO / Senior Developer Handoff Document**
Version: 2.1
Focus: **High performance local multimedia browser Chrome Extension MVP**

---

## 1. Executive Summary

VaultView is a **Chrome Extension + App Shell** that transforms local folders into a high-speed multimedia library.

Users choose folders. App scans files, indexes media, generates thumbnails, and provides an elite browsing experience.

Core promise:

> Choose folder → browse instantly → never use ugly folders again

---

## 2. Non-Negotiable Product Principles

### Performance First
Every engineering decision prioritizes:

- speed
- responsiveness
- low memory use
- smooth scrolling
- instant search

### Functional > Fancy
No wasted animation-heavy UI until engine is elite.

### Local First
No cloud dependency.

### Privacy First
All processing local.

---

## 3. Platform Scope (MVP)

### Supported
- Chrome Extension Manifest V3
- Chromium browsers
- Windows
- macOS
- Linux

### Later
- Edge Store
- Standalone Electron App
- Safari

---

## 4. Core User Flow

1. Install extension  
2. Open dashboard  
3. Choose Folder  
4. Permission granted  
5. Scan begins  
6. Thumbnails stream in live  
7. User browses media

---

## 5. Architecture Overview

```text
UI Layer (React App)
├── Zustand State
├── Virtualized Views
├── Media Viewers

App Services (Main Thread)
├── Scan Engine (traversal — handles are not transferable)
├── Metadata Engine (video/audio need DOM elements)

Worker Layer
├── Thumb Worker (OffscreenCanvas image thumbnails)
├── Search Worker (in-memory index)
└── Sort Worker (large dataset sorting)

Storage Layer
├── IndexedDB (Dexie) — file index + folder handles
├── Cache API — thumbnail blob storage

Chrome Extension Layer
├── Manifest V3
├── Background Worker
└── Launch Entry
```

---

## 6. Tech Stack

- React
- TypeScript
- Vite
- TailwindCSS
- Zustand
- Dexie.js
- TanStack Virtual

---

## 7. Folder Access Layer

Use:

```ts
window.showDirectoryPicker()
```

Persist handles in IndexedDB.

On launch:

```ts
await handle.queryPermission()
```

---

## 8. Storage Schema (Dexie)

### folders

```ts
{
 id: string
 name: string
 handle: FileSystemDirectoryHandle
 createdAt: number
 lastScanAt: number
}
```

### files

```ts
{
 id: string
 folderId: string
 path: string
 name: string
 ext: string
 mediaType: "image" | "video" | "audio" | "other"
 size: number
 modified: number
 width?: number
 height?: number
 duration?: number
 thumbKey?: string
 indexedAt: number
}
```

### thumbs

Thumbnail blobs are stored in the **Cache API** (`caches.open("vaultview-thumbs")`), not in IndexedDB. The `thumbKey` field on the `files` table references the cache key. This avoids bloating the Dexie database with binary data.

---

## 9. File Scanner Engine

Runs on **main thread** — `FileSystemDirectoryHandle` is not transferable to Workers via `postMessage`. Offload heavy processing (thumbnails, search indexing) to workers after file entries are discovered.

### Queue BFS Traversal

```ts
async function traverse(dirHandle) {
 for await (const entry of dirHandle.values()) {
   if (entry.kind === "directory") queue.push(entry)
   else processFile(entry)
 }
}
```

### Batch Strategy

- 100 entries / cycle
- yield often to keep UI responsive

```ts
await new Promise(r => setTimeout(r, 0))
```

### Incremental / Delta Scan

On repeat scans, diff against stored `files.modified` timestamps. Skip files that haven't changed. Only re-index new or modified files. Delete DB entries for files that no longer exist on disk.

---

## 10. Supported File Types

### Images
jpg jpeg png webp gif avif bmp

> **Note:** HEIC is not natively decodable in Chrome. Deferred to post-MVP (requires WASM decoder like libheif-js).

### Videos
mp4 mkv webm mov avi

### Audio
mp3 wav flac m4a ogg aac

---

## 11. Metadata Engine

Runs on **main thread** — video/audio metadata extraction requires DOM elements.

### Images
Use `createImageBitmap()` for dimensions (can be offloaded to Worker).

### Video
Use hidden `<video>` element (main thread only):

- duration
- width
- height

### Audio
Use `<audio>` element for duration (main thread only).

---

## 12. Thumbnail Engine

### Backpressure

Limit concurrent thumbnail generation to **4 images** and **2 videos** at a time. Use a simple semaphore/queue to prevent flooding when scanner discovers thousands of files at once.

### Storage

Use the **Cache API** (`caches.open("vaultview-thumbs")`) for thumbnail blob storage instead of IndexedDB. The Cache API is purpose-built for blob storage, avoids bloating the Dexie database, and has better browser eviction semantics. The `thumbKey` on the files table stores the cache key.

### Images

Offload to Worker via `OffscreenCanvas`:

```ts
File → createImageBitmap
→ OffscreenCanvas
→ resize 256px
→ convertToBlob()
→ store in Cache API
```

### Videos

Runs on **main thread** (requires DOM `<video>` element):

```ts
load video → hidden <video> element
seek 1 sec
capture frame → canvas.drawImage()
save blob → Cache API
```

Concurrency cap: 2 simultaneous video thumbnail jobs.

### Audio

Use generic icon for MVP.

---

## 13. UI Component Tree

```text
App
├── Dashboard
├── FolderSidebar
├── Toolbar
├── SearchBar
├── MediaGrid
│   └── MediaCard
├── ViewerModal
│   ├── ImageViewer
│   ├── VideoPlayer
│   └── AudioPlayer
└── Settings
```

---

## 14. State Architecture (Zustand)

### foldersSlice
- folders
- activeFolderId

### mediaSlice
- files
- selectedFile
- filters

### scanSlice
- progress
- isScanning

### uiSlice
- theme
- gridSize
- viewerOpen

---

## 15. Rendering Performance Rules

- Virtualize all grids
- Never mount thousands of DOM nodes
- Lazy load images
- Revoke object URLs after unmount

---

## 16. Search Engine MVP

Runs in a **dedicated Search Worker** with an **in-memory inverted index**.

### Index Strategy

On load, hydrate a lightweight in-memory index from Dexie. Update incrementally as new files are scanned.

### Tokenization

> Beach Holiday.mp4 → ["beach", "holiday", "mp4"]

Lowercase, split on non-alphanumeric. Prefix match against index.

### Goal

- <50ms for 10k files
- Index memory footprint: ~2-3 MB for 25k files

---

## 17. Sorting Engine

Support:

- name
- modified date
- size
- media type

Use worker for huge sets.

---

## 18. Viewer Specs

### Image Viewer
- zoom
- pan
- arrows
- fullscreen

### Video Viewer
- play
- seek
- speed

### Audio Viewer
- queue
- next/prev

---

## 19. Memory Management

- Max in-memory thumbs: 100
- LRU eviction
- Never hold originals in RAM
- Revoke URLs

---

## 20. Error Handling

- Permission lost → reconnect CTA
- Broken files → skip/log
- Unsupported codec → open externally

---

## 21. Chrome Extension Structure

```text
/public
 manifest.json

/src
 main.tsx
 App.tsx
 workers/
 services/
 db/
 components/
```

---

## 22. Manifest V3

```json
{
  "manifest_version": 3,
  "name": "VaultView",
  "version": "0.1",
  "permissions": ["storage", "unlimitedStorage"]
}
```

---

## 23. Benchmarks

### 5k files
- smooth scroll

### 10k files
- search <50ms

### 25k files
- usable

---

## 24. 30-Day Sprint

### Week 1
- shell
- DB
- picker

### Week 2
- scanner

### Week 3
- thumbs
- grid
- viewer

### Week 4
- search
- sort
- package

---

## 25. Critical Anti-Patterns

### Avoid
- render all items
- sync scanning
- eager thumbnails
- repeated decoding

### Do
- workerize
- lazy load
- cache
- batch writes

---

## 26. Future Revenue Features

- AI search
- duplicate finder
- cloud sync
- themes
- collections

---

## 27. Launch KPI

> This is better than Finder.

---

## 28. Final Developer Instruction

Build engine first. UI polish second.
