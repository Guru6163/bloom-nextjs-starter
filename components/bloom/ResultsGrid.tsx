/**
 * components/bloom/ResultsGrid.tsx
 *
 * Displays generated images below the generator form.
 * Also handles the loading status banner and error state.
 *
 * The aspect-ratio of each image tile matches the aspect ratio the user
 * selected — results are not forced into a fixed 16:9 box.
 *
 * Fits in: rendered at the bottom of the BloomGenerator card, below
 * the form body, when generation is running or has completed.
 */

import Image from "next/image"
import type { AspectRatio } from "@/lib/bloom-api"
import { toAspectRatioClass } from "./constants"

export interface ResultsGridProps {
  images: string[]
  /** The aspect ratio the user selected — used to size each image tile correctly. */
  aspectRatio: AspectRatio
  loading: boolean
  error: string | null
}

/**
 * Renders the generation status, error banner, and image grid.
 * Returns null when there is nothing to show (no loading, no error, no images).
 */
export default function ResultsGrid({ images, aspectRatio, loading, error }: ResultsGridProps) {
  if (!loading && !error && images.length === 0) {
    return null
  }

  const aspectClass = toAspectRatioClass(aspectRatio)

  return (
    <>
      {error && (
        <div
          className="mx-6 mb-6 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive sm:mx-8"
          role="alert"
        >
          <p className="font-medium">Something went wrong</p>
          <p className="mt-1 opacity-90">{error}</p>
        </div>
      )}

      {loading && (
        <div className="border-t border-border bg-muted/50 px-6 py-4 sm:px-8">
          <p className="text-center text-sm text-muted-foreground">
            Holding connection while Bloom finishes your images…
          </p>
        </div>
      )}

      {images.length > 0 && !loading && (
        <div className="border-t border-border bg-muted/30 px-6 py-6 sm:px-8 sm:py-8">
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Results
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {images.map((url, i) => (
              <div
                key={url}
                className={`relative overflow-hidden rounded-2xl border border-border bg-background ${aspectClass}`}
              >
                <Image
                  src={url}
                  alt={`Generated image ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
