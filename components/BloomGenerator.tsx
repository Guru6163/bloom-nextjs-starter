"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { useBloom } from "@/hooks/useBloom"
import type { AspectRatio } from "@/hooks/useBloom"

const ASPECT_RATIOS: { label: string; value: AspectRatio }[] = [
  { label: "Square (1:1)", value: "1:1" },
  { label: "Portrait (4:5)", value: "4:5" },
  { label: "Story (9:16)", value: "9:16" },
  { label: "Landscape (16:9)", value: "16:9" },
  { label: "Ultrawide (21:9)", value: "21:9" },
]

/** trybloom.ai input field pattern (rounded-lg border-input, ring on focus) */
const fieldClass =
  "flex w-full min-w-0 rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-none transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"

export interface BloomGeneratorProps {
  /** Default prompt to pre-fill the input. */
  defaultPrompt?: string
  /** Default aspect ratio. Defaults to "16:9". */
  defaultAspectRatio?: AspectRatio
  /** Default number of variants (1-5). Defaults to 2. */
  defaultVariantCount?: number
  /** Called with image URLs when generation completes. */
  onGenerated?: (urls: string[]) => void
}

function clampVariantCount(n: number): number {
  return Math.min(5, Math.max(1, n))
}

export default function BloomGenerator({
  defaultPrompt = "",
  defaultAspectRatio = "16:9",
  defaultVariantCount = 2,
  onGenerated,
}: BloomGeneratorProps) {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [aspectRatio, setAspectRatio] =
    useState<AspectRatio>(defaultAspectRatio)
  const [variantCount, setVariantCount] = useState(() =>
    clampVariantCount(defaultVariantCount)
  )

  const { generate, images, loading, error, reset } = useBloom()
  const wasLoadingRef = useRef(false)

  useEffect(() => {
    const wasLoading = wasLoadingRef.current
    wasLoadingRef.current = loading

    if (
      wasLoading &&
      !loading &&
      images.length > 0 &&
      error === null &&
      onGenerated
    ) {
      onGenerated(images)
    }
  }, [loading, images, error, onGenerated])

  async function handleGenerate() {
    const trimmed = prompt.trim()
    if (!trimmed) {
      return
    }
    await generate(trimmed, aspectRatio, variantCount)
  }

  function handleReset() {
    reset()
  }

  const primaryBtn =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-primary-foreground transition-all [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary primary-button-shadow hover:bg-primary/90"

  const ghostBtn =
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 inline-flex h-9 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:bg-accent hover:text-accent-foreground hover:opacity-90"

  return (
    <div className="relative z-[1] mx-auto max-w-[720px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
            <Image
              src="/bloom-icon-512.png"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10 shrink-0"
            />
            <div className="min-w-0 flex-1 text-left">
              <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Bloom starter
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
                Image generator
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Describe what you need—Bloom keeps it on-brand.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          <div className="space-y-2">
            <label
              htmlFor="bloom-prompt"
              className="text-sm font-medium text-foreground"
            >
              Prompt
            </label>
            <textarea
              id="bloom-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. summer sale hero, soft daylight, product front and center"
              rows={4}
              disabled={loading}
              className={`${fieldClass} min-h-[108px] resize-y md:text-sm`}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <label
                htmlFor="bloom-aspect"
                className="text-sm font-medium text-foreground"
              >
                Aspect ratio
              </label>
              <select
                id="bloom-aspect"
                value={aspectRatio}
                onChange={(e) =>
                  setAspectRatio(e.target.value as AspectRatio)
                }
                disabled={loading}
                className={`${fieldClass} h-9`}
              >
                {ASPECT_RATIOS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="bloom-variants"
                className="text-sm font-medium text-foreground"
              >
                Variants
              </label>
              <select
                id="bloom-variants"
                value={variantCount}
                onChange={(e) =>
                  setVariantCount(clampVariantCount(Number(e.target.value)))
                }
                disabled={loading}
                className={`${fieldClass} h-9`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void handleGenerate()}
                disabled={loading || !prompt.trim()}
                className={primaryBtn}
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span
                      className="size-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground"
                      aria-hidden
                    />
                    Generating
                  </span>
                ) : (
                  "Generate"
                )}
              </button>
              {images.length > 0 && !loading && (
                <button
                  type="button"
                  onClick={handleReset}
                  className={ghostBtn}
                >
                  Clear results
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground sm:max-w-[220px] sm:text-right">
              First run can take ~30s while images finish.
            </p>
          </div>
        </div>

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
                  className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-background object-cover"
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
      </div>
    </div>
  )
}
