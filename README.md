# VaultView

High-speed local multimedia browser as a Chrome Extension. Pick a folder, scan it, and browse your media instantly with a virtualized grid, thumbnails, and built-in viewers.

## Features

- **Folder scanning** — BFS traversal with batched indexing and incremental re-scans
- **Thumbnail generation** — Image thumbnails via Web Worker + OffscreenCanvas, video frame capture on main thread, concurrency-limited queues
- **Virtualized grid** — TanStack Virtual for smooth scrolling at 10k+ files with LRU-cached object URLs
- **Built-in viewers** — Image viewer with zoom/pan, video player with speed controls, audio player
- **Search** — Worker-powered in-memory inverted index with prefix matching (<50ms at 10k files)
- **Sort & filter** — Sort by name, date, size, or type; filter by media category
- **Local & private** — All processing happens on your machine, no cloud dependency

## Supported File Types

| Images | Videos | Audio |
|--------|--------|-------|
| jpg, jpeg, png, webp, gif, avif, bmp | mp4, mkv, webm, mov, avi | mp3, wav, flac, m4a, ogg, aac |

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS v4
- Zustand (state management)
- Dexie.js (IndexedDB)
- TanStack Virtual (virtualized grid)
- Cache API (thumbnail storage)
- Web Workers (thumbnails, search, sort)
- Chrome Extension Manifest V3

## Getting Started

### Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

### Build & Load as Extension

```bash
npm run build
```

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist/` folder

Click the VaultView icon in your toolbar to open it in a new tab.

## Architecture

```
UI Layer (React)
├── Zustand State (folders, media, scan, ui slices)
├── Virtualized Grid (TanStack Virtual)
└── Media Viewers (image zoom/pan, video, audio)

Services (Main Thread)
├── Scanner (BFS traversal, batch yield, delta scan)
├── Metadata (video/audio via DOM elements)
└── Video Thumbnailer (hidden <video> + canvas capture)

Workers
├── Thumb Worker (createImageBitmap + OffscreenCanvas)
├── Search Worker (in-memory inverted index)
└── Sort Worker (offloaded for large datasets)

Storage
├── IndexedDB via Dexie (file index, folder handles)
└── Cache API (thumbnail blobs)
```

## License

MIT
