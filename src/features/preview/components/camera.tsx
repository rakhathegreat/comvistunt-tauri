import { forwardRef, useEffect, useImperativeHandle, useRef, useState, type ForwardedRef } from "react";

const STREAM_URL = "http://127.0.0.1:8000/video";

type CameraProps = {
  active: boolean;
};

export type CameraHandle = {
  captureFrame: () => Promise<Blob | null>;
};

function Camera({ active }: CameraProps, ref: ForwardedRef<CameraHandle>) {
  const [hasError, setHasError] = useState(false);
  const [streamKey, setStreamKey] = useState<number | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Saat active berubah
  useEffect(() => {
    if (active) {
      // mulai stream baru
      setHasError(false);
      setStreamKey(Date.now());
    } else {
      // matikan stream → <img> akan di-unmount
      setHasError(false);
      setStreamKey(null);
    }
  }, [active]);

  const reload = async () => {
    if (!active) return;
    await fetch(`${STREAM_URL}/stop`, { method: "POST" });
    setHasError(false);
    setStreamKey(Date.now());
  };

  const captureFrame = async (): Promise<Blob | null> => {
    const img = imageRef.current;
    if (!img || !img.naturalWidth || !img.naturalHeight) return null;

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    try {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    } catch (err) {
      console.error("Failed to draw frame to canvas", err);
      return null;
    }

    return new Promise((resolve) => {
      try {
        canvas.toBlob((blob) => resolve(blob), "image/jpeg", 0.92);
      } catch (err) {
        console.error("Failed to read frame from canvas", err);
        resolve(null);
      }
    });
  };

  useImperativeHandle(ref, () => ({
    captureFrame,
  }));

  const src = streamKey ? `${STREAM_URL}?t=${streamKey}` : undefined;

  return (
    <div className="relative h-full w-full overflow-hidden bg-black">
      {/* Hanya render <img> kalau streamKey ada → berarti active = true */}
      {streamKey && (
        <img
          ref={imageRef}
          key={streamKey} // memastikan element baru tiap reload
          src={src}
          alt="Camera stream"
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
          onLoad={() => setHasError(false)}
        />
      )}

      {/* Stream Error */}
      {hasError && active && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background/70 text-sm text-muted-foreground backdrop-blur">
          <p>Tidak bisa memuat stream dari {STREAM_URL}</p>
          <button
            type="button"
            className="rounded-md border border-border px-3 py-1 text-xs font-medium text-foreground hover:bg-accent"
            onClick={reload}
          >
            Coba lagi
          </button>
        </div>
      )}

      {/* Kamera dimatikan */}
      {!active && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/70 text-sm text-muted-foreground backdrop-blur">
          <p>Kamera diputuskan dari endpoint</p>
        </div>
      )}
    </div>
  );
}

export default forwardRef(Camera);
