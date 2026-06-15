// 12400 → "12.4K"
export const formatCount = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

// "2 hours ago"
export const timeAgo = (dateStr: string): string => {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins  / 60)
  const days  = Math.floor(hours / 24)
  if (mins  < 1)  return 'just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

// "11 Mar 2026"
export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })

// hex → rgba with opacity for tinted backgrounds
export const hexToRgba = (hex: string, opacity: number): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${opacity})`
}

// Clamp text to N words
export const truncate = (str: string, words: number): string => {
  const arr = str.split(' ')
  if (arr.length <= words) return str
  return arr.slice(0, words).join(' ') + '…'
}

const SRC_SET_BREAKPOINTS = [480, 768, 1200]

// Build a Cloudinary URL with exact output dimensions for the placeholder.
// Uses c_fill,g_auto to ensure proper aspect ratio filling.
export function cloudinaryUrl(
  url: string | null | undefined,
  width: number,
  height: number,
): string {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com')) return url
  const transform = `w_${Math.round(width)},h_${Math.round(height)},c_fill,g_auto,f_auto,q_auto`
  return url.replace('/image/upload/', `/image/upload/${transform}/`)
}

// Generate a srcSet string at standard breakpoints, preserving aspect ratio.
export function cloudinarySrcSet(
  url: string | null | undefined,
  width: number,
  height: number,
): string {
  if (!url) return ''
  if (!url.includes('res.cloudinary.com')) return ''
  const aspect = width / height
  return SRC_SET_BREAKPOINTS
    .map(w => {
      const h = Math.round(w / aspect)
      const t = `w_${w},h_${h},c_fill,g_auto,f_auto,q_auto`
      const u = url.replace('/image/upload/', `/image/upload/${t}/`)
      return `${u} ${w}w`
    })
    .join(', ')
}