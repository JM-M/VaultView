import { useEffect } from "react";

interface KeyboardNavOptions {
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
  enabled: boolean;
}

export function useKeyboardNav({
  onPrev,
  onNext,
  onClose,
  enabled,
}: KeyboardNavOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          onPrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          onNext();
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [enabled, onPrev, onNext, onClose]);
}
