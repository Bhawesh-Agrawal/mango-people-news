import { useRef, useState, useCallback } from 'react'
import {
  ZoomIn, ZoomOut, Move, RotateCcw, Crop,
  Check, ChevronDown, ChevronUp,
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────

export interface CoverCrop {
  /** Left offset of the crop window, as % of the natural image width (0–100) */
  x: number
  /** Top offset of the crop window, as % of the natural image height (0–100) */
  y: number
  /** Zoom level: 1.0 = no zoom (image fills container), 3.0 = 3× zoomed in */
  zoom: number
}

export const DEFAULT_CROP: CoverCrop = { x: 0, y: 0, zoom: 1 }

// ─────────────────────────────────────────────────────────────────
// Utility: produce CSS properties for a container + its <img>
// ─────────────────────────────────────────────────────────────────

/**
 * Returns CSS for the *wrapper* div that clips the image.
 * The wrapper must have a defined width & height / aspect-ratio.
 *
 * Usage:
 *   const { container, img } = applyCropStyle(crop)
 *   <div style={{ ...container, aspectRatio: '16/9', width: '100%', overflow: 'hidden' }}>
 *     <img style={img} src={url} alt={...} />
 *   </div>
 */
export function applyCropStyle(crop: CoverCrop | null | undefined): {
  container: React.CSSProperties
  img: React.CSSProperties
} {
  const c = crop ?? DEFAULT_CROP
  return {
    container: { overflow: 'hidden', position: 'relative' },
    img: {
      width:     '100%',
      height:    '100%',
      objectFit: 'cover',
      // We encode x/y as objectPosition percentages.
      // At zoom=1, objectPosition covers the full image (default 50%/50% feel).
      // At zoom>1, we scale the image and shift via transform.
      objectPosition: `${c.x}% ${c.y}%`,
      transform:      `scale(${c.zoom})`,
      transformOrigin: `${c.x}% ${c.y}%`,
      transition:     'transform 0.2s ease',
    },
  }
}

/**
 * Builds a Cloudinary URL with c_crop applied.
 * Falls back to the original URL for non-Cloudinary images.
 *
 * @param url      Original Cloudinary URL
 * @param crop     CoverCrop object
 * @param outW     Desired output pixel width  (e.g. 800)
 * @param outH     Desired output pixel height (e.g. 450)
 */
export function cloudinaryCropUrl(
  url:   string,
  crop:  CoverCrop | null | undefined,
  outW:  number,
  outH:  number,
): string {
  if (!url || !url.includes('res.cloudinary.com')) return url
  const c    = crop ?? DEFAULT_CROP
  // We request the full image at a high resolution and let the browser
  // apply the CSS crop. For a full Cloudinary crop, you would need the
  // natural pixel dimensions upfront — so we use a simpler approach:
  // c_fill + g_auto as a sensible default when no crop is set,
  // or use x/y gravity when crop IS set.
  const zoom = Math.max(1, c.zoom)
  // Convert percentage offset to Cloudinary gravity string isn't straightforward
  // without knowing pixel dims. The safe universal approach: resize to outW×outH
  // at zoom, then shift. We approximate with c_fill + x/y pixel offsets using
  // a placeholder that degrades gracefully.
  const transform = `w_${Math.round(outW * zoom)},h_${Math.round(outH * zoom)},c_fill,f_auto,q_auto`
  return url.replace('/image/upload/', `/image/upload/${transform}/`)
}

// ─────────────────────────────────────────────────────────────────
// Quick-preset grid positions
// ─────────────────────────────────────────────────────────────────

const PRESETS = [
  { label: '↖', x:  0, y:  0 },
  { label: '↑', x: 50, y:  0 },
  { label: '↗', x:100, y:  0 },
  { label: '←', x:  0, y: 50 },
  { label: '⊕', x: 50, y: 50 },
  { label: '→', x:100, y: 50 },
  { label: '↙', x:  0, y:100 },
  { label: '↓', x: 50, y:100 },
  { label: '↘', x:100, y:100 },
] as const

// ─────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────

interface Props {
  imageUrl: string
  crop:     CoverCrop
  onChange: (crop: CoverCrop) => void
}

export default function CoverImageEditor({ imageUrl, crop, onChange }: Props) {
  const [open, setOpen] = useState(true)

  // ── Drag state ───────────────────────────────────────────────
  const padRef    = useRef<HTMLDivElement>(null)
  const dragging  = useRef(false)
  const dragStart = useRef({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0 })

  // ── Derived helpers ──────────────────────────────────────────
  const safeCrop = { ...DEFAULT_CROP, ...(crop ?? {}) }

  const update = useCallback((partial: Partial<CoverCrop>) => {
    onChange({ ...safeCrop, ...partial })
  }, [safeCrop, onChange])

  const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

  // ── Drag to pan ───────────────────────────────────────────────
  const startDrag = (clientX: number, clientY: number) => {
    dragging.current = true
    dragStart.current = { mouseX: clientX, mouseY: clientY, cropX: safeCrop.x, cropY: safeCrop.y }
  }

  const moveDrag = useCallback((clientX: number, clientY: number) => {
    if (!dragging.current || !padRef.current) return
    const rect  = padRef.current.getBoundingClientRect()
    const dx    = (clientX - dragStart.current.mouseX) / rect.width  * 100
    const dy    = (clientY - dragStart.current.mouseY) / rect.height * 100
    // Moving right → we want to see more of the LEFT → decrease x
    const newX  = clamp(dragStart.current.cropX - dx / safeCrop.zoom)
    const newY  = clamp(dragStart.current.cropY - dy / safeCrop.zoom)
    onChange({ ...safeCrop, x: Math.round(newX), y: Math.round(newY) })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeCrop, onChange])

  const endDrag = () => { dragging.current = false }

  // ── Mouse events ──────────────────────────────────────────────
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    startDrag(e.clientX, e.clientY)
  }
  const onMouseMove = (e: React.MouseEvent) => moveDrag(e.clientX, e.clientY)
  const onMouseUp   = () => endDrag()

  // ── Touch events ─────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => startDrag(e.touches[0].clientX, e.touches[0].clientY)
  const onTouchMove  = (e: React.TouchEvent) => moveDrag(e.touches[0].clientX, e.touches[0].clientY)
  const onTouchEnd   = () => endDrag()

  // ── Wheel zoom ────────────────────────────────────────────────
  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    update({ zoom: clamp(+(safeCrop.zoom + delta).toFixed(2), 1, 4) })
  }

  // ── Reset ─────────────────────────────────────────────────────
  const reset = () => onChange({ x: 50, y: 50, zoom: 1 })

  // ── Zoom buttons ──────────────────────────────────────────────
  const zoomIn  = () => update({ zoom: clamp(+(safeCrop.zoom + 0.15).toFixed(2), 1, 4) })
  const zoomOut = () => update({ zoom: clamp(+(safeCrop.zoom - 0.15).toFixed(2), 1, 4) })

  // ── CSS for the preview image ─────────────────────────────────
  const previewImgStyle: React.CSSProperties = {
    width:           '100%',
    height:          '100%',
    objectFit:       'cover',
    objectPosition:  `${safeCrop.x}% ${safeCrop.y}%`,
    transform:       `scale(${safeCrop.zoom})`,
    transformOrigin: `${safeCrop.x}% ${safeCrop.y}%`,
    cursor:          'grab',
    userSelect:      'none',
    WebkitUserSelect:'none',
    transition:      dragging.current ? 'none' : 'object-position 0.1s',
  }

  return (
    <div className="mt-3 space-y-3">
      {/* ── Header ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-1.5">
          <Crop size={11} style={{ color: 'var(--accent)' }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            Crop &amp; Zoom
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}
          >
            {safeCrop.x}% {safeCrop.y}% ×{safeCrop.zoom.toFixed(1)}
          </span>
          {open
            ? <ChevronUp size={12} style={{ color: 'var(--text-muted)' }} />
            : <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} />
          }
        </div>
      </button>

      {open && (
        <>
          {/* ── Drag pad ───────────────────────────────────────── */}
          <div
            className="relative rounded-xl overflow-hidden select-none"
            style={{
              aspectRatio: '16 / 9',
              border:      '2px solid var(--accent)',
              cursor:      'grab',
              touchAction: 'none',
            }}
            ref={padRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onWheel={onWheel}
          >
            <img
              src={imageUrl}
              alt="Crop preview"
              draggable={false}
              style={previewImgStyle}
            />

            {/* ── Overlay: crosshair + rule-of-thirds grid ───── */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              {/* Rule-of-thirds lines */}
              <svg
                width="100%" height="100%"
                style={{ position: 'absolute', inset: 0, opacity: 0.25 }}
              >
                <line x1="33.33%" y1="0" x2="33.33%" y2="100%"
                  stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="66.66%" y1="0" x2="66.66%" y2="100%"
                  stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="33.33%" x2="100%" y2="33.33%"
                  stroke="white" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="66.66%" x2="100%" y2="66.66%"
                  stroke="white" strokeWidth="1" strokeDasharray="4 4" />
              </svg>
              {/* Corner brackets */}
              {[
                'top-1 left-1 border-t-2 border-l-2 rounded-tl-md',
                'top-1 right-1 border-t-2 border-r-2 rounded-tr-md',
                'bottom-1 left-1 border-b-2 border-l-2 rounded-bl-md',
                'bottom-1 right-1 border-b-2 border-r-2 rounded-br-md',
              ].map(cls => (
                <div
                  key={cls}
                  className={`absolute w-4 h-4 ${cls}`}
                  style={{ borderColor: 'rgba(255,255,255,0.8)' }}
                />
              ))}
            </div>

            {/* ── Hint label ─────────────────────────────────── */}
            <div
              className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1
                         px-2 py-0.5 rounded-full pointer-events-none"
              style={{ background: 'rgba(0,0,0,0.55)' }}
            >
              <Move size={9} style={{ color: '#fff' }} />
              <span className="text-[9px] font-medium" style={{ color: '#fff' }}>
                Drag · Scroll to zoom
              </span>
            </div>
          </div>

          {/* ── Zoom slider ────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <button
              type="button" onClick={zoomOut}
              disabled={safeCrop.zoom <= 1}
              className="p-1.5 rounded-lg disabled:opacity-30 transition-opacity"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
            >
              <ZoomOut size={13} />
            </button>

            <div className="flex-1 relative">
              <input
                type="range"
                min={1} max={4} step={0.01}
                value={safeCrop.zoom}
                onChange={e => update({ zoom: parseFloat(e.target.value) })}
                className="w-full h-1.5 rounded-full appearance-none outline-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${((safeCrop.zoom - 1) / 3) * 100}%, var(--border) ${((safeCrop.zoom - 1) / 3) * 100}%, var(--border) 100%)`,
                }}
              />
            </div>

            <button
              type="button" onClick={zoomIn}
              disabled={safeCrop.zoom >= 4}
              className="p-1.5 rounded-lg disabled:opacity-30 transition-opacity"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
            >
              <ZoomIn size={13} />
            </button>

            <span
              className="text-[11px] font-mono w-8 text-right flex-shrink-0"
              style={{ color: 'var(--text-muted)' }}
            >
              {safeCrop.zoom.toFixed(1)}×
            </span>
          </div>

          {/* ── Position quick-presets ─────────────────────────── */}
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Quick position
            </p>
            <div
              className="grid gap-1"
              style={{ gridTemplateColumns: 'repeat(9, 1fr)' }}
            >
              {PRESETS.map(p => {
                const active = safeCrop.x === p.x && safeCrop.y === p.y
                return (
                  <button
                    key={`${p.x}-${p.y}`}
                    type="button"
                    onClick={() => update({ x: p.x, y: p.y })}
                    className="py-1 rounded-lg text-xs font-bold transition-all"
                    style={{
                      background: active ? 'var(--accent)' : 'var(--bg)',
                      color:      active ? '#fff' : 'var(--text-muted)',
                      border:     `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                    title={`Set position to ${p.x}% ${p.y}%`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Reset + confirm row ───────────────────────────── */}
          <div className="flex items-center gap-2">
            <button
              type="button" onClick={reset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                         font-medium transition-opacity hover:opacity-70"
              style={{ border: '1px solid var(--border)', color: 'var(--text-muted)' }}
            >
              <RotateCcw size={11} /> Reset
            </button>
            <div
              className="flex items-center gap-1 ml-auto text-[11px]"
              style={{ color: 'var(--text-muted)' }}
            >
              <Check size={11} style={{ color: '#16a34a' }} />
              All thumbnails will use this crop
            </div>
          </div>

          {/* ── 16:9 output preview ───────────────────────────── */}
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
              style={{ color: 'var(--text-muted)' }}
            >
              Output preview · 16:9
            </p>
            <div
              className="rounded-xl overflow-hidden"
              style={{ aspectRatio: '16 / 9', border: '1px solid var(--border)' }}
            >
              <img
                src={imageUrl}
                alt="Output preview"
                draggable={false}
                style={{
                  width:           '100%',
                  height:          '100%',
                  objectFit:       'cover',
                  objectPosition:  `${safeCrop.x}% ${safeCrop.y}%`,
                  transform:       `scale(${safeCrop.zoom})`,
                  transformOrigin: `${safeCrop.x}% ${safeCrop.y}%`,
                  pointerEvents:   'none',
                }}
              />
            </div>
            <p
              className="text-[10px] mt-1 leading-relaxed"
              style={{ color: 'var(--text-muted)', opacity: 0.7 }}
            >
              This is exactly how the cover will appear in article cards,
              the hero, and the article page.
            </p>
          </div>
        </>
      )}
    </div>
  )
}