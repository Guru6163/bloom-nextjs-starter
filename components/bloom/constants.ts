/**
 * components/bloom/constants.ts
 *
 * Shared constants for the BloomGenerator component tree.
 *
 * Centralising these here prevents the same string from drifting out of
 * sync across BrandPicker, GenerationControls, and ResultsGrid.
 */

import type { AspectRatio } from "@/lib/bloom-api"

/** Aspect ratio options shown in the generator's select input. */
export const ASPECT_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: "Square (1:1)", value: "1:1" },
  { label: "Portrait (4:5)", value: "4:5" },
  { label: "Story (9:16)", value: "9:16" },
  { label: "Landscape (16:9)", value: "16:9" },
  { label: "Ultrawide (21:9)", value: "21:9" },
]

/**
 * Maps an AspectRatio value to its Tailwind aspect-ratio utility class.
 * Bloom uses colon notation ("16:9"); Tailwind arbitrary values use slash ("16/9").
 */
const ASPECT_RATIO_CLASS: Record<AspectRatio, string> = {
  "1:1": "aspect-square",
  "2:3": "aspect-[2/3]",
  "3:2": "aspect-[3/2]",
  "3:4": "aspect-[3/4]",
  "4:3": "aspect-[4/3]",
  "4:5": "aspect-[4/5]",
  "5:4": "aspect-[5/4]",
  "9:16": "aspect-[9/16]",
  "16:9": "aspect-video",
  "21:9": "aspect-[21/9]",
}

/**
 * Returns the Tailwind utility class for a given aspect ratio.
 * Falls back to "aspect-video" (16:9) for any ratio not in the map.
 */
export function toAspectRatioClass(ratio: AspectRatio): string {
  return ASPECT_RATIO_CLASS[ratio] ?? "aspect-video"
}

/** trybloom.ai input field — rounded border with focus ring. */
export const fieldClass =
  "flex w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-none transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"

/** Filled primary action button. */
export const primaryBtnClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground transition-all [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary primary-button-shadow hover:bg-primary/90"

/** Ghost/outline secondary action button. */
export const ghostBtnClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:bg-accent hover:text-accent-foreground hover:opacity-90"
