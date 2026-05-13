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

  return (
    <div className="mx-auto max-w-2xl bg-zinc-900 p-6 text-white">
      <header className="mb-6 space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">
          Bloom Image Generator
        </h2>
        <p className="text-zinc-400">
          Generate on-brand images powered by Bloom
        </p>
      </header>

      <div className="space-y-4 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
        <div className="space-y-2">
          <label htmlFor="bloom-prompt" className="block text-sm text-zinc-400">
            Prompt
          </label>
          <textarea
            id="bloom-prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A bold product hero image with clean composition"
            rows={3}
            disabled={loading}
            className="w-full resize-y rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex-1 space-y-2">
            <label
              htmlFor="bloom-aspect"
              className="block text-sm text-zinc-400"
            >
              Aspect Ratio
            </label>
            <select
              id="bloom-aspect"
              value={aspectRatio}
              onChange={(e) =>
                setAspectRatio(e.target.value as AspectRatio)
              }
              disabled={loading}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {ASPECT_RATIOS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 space-y-2">
            <label
              htmlFor="bloom-variants"
              className="block text-sm text-zinc-400"
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
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-white focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading || !prompt.trim()}
            className="rounded-md bg-white px-4 py-2 font-medium text-zinc-900 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Generating..." : "Generate"}
          </button>
          {images.length > 0 && !loading && (
            <button
              type="button"
              onClick={handleReset}
              className="rounded-md bg-zinc-700 px-4 py-2 font-medium text-white hover:bg-zinc-600"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {error && (
        <div
          className="mt-4 rounded-lg border border-red-800 bg-red-950 px-4 py-3 text-red-400"
          role="alert"
        >
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="mt-4 text-zinc-400">
          <p>Generating your images... this takes about 30 seconds</p>
        </div>
      )}

      {images.length > 0 && !loading && (
        <div className="mt-6 grid grid-cols-2 gap-4">
          {images.map((url, i) => (
            <div
              key={url}
              className="relative aspect-video overflow-hidden rounded-lg border border-zinc-700"
            >
              <Image
                src={url}
                alt={`Generated image ${i + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
