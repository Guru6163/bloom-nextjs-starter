"use client"

/**
 * components/BloomGenerator.tsx
 *
 * Drop-in React component for generating on-brand images with the Bloom API.
 *
 * Orchestrates four focused sub-components and two hooks:
 *   useBrandList  — fetches and tracks brand session state
 *   useBloom      — runs the generate → wait flow
 *   GeneratorHeader    — static card header (logo, title)
 *   BrandPicker        — brand session selector
 *   GenerationControls — prompt, aspect ratio, variant count, action buttons
 *   ResultsGrid        — loading state, error banner, generated image tiles
 *
 * The Bloom API key never reaches the client — all requests go through
 * /api/bloom/* server routes.
 *
 * Usage:
 *   <BloomGenerator
 *     defaultPrompt="A bold product hero image"
 *     defaultAspectRatio="16:9"
 *     defaultVariantCount={2}
 *     onGenerated={(urls) => console.log(urls)}
 *   />
 */

import { useState, useEffect, useRef } from "react"
import { useBloom } from "@/hooks/useBloom"
import { useBrandList } from "@/hooks/useBrandList"
import type { AspectRatio } from "@/lib/bloom-api"
import GeneratorHeader from "@/components/bloom/GeneratorHeader"
import BrandPicker from "@/components/bloom/BrandPicker"
import GenerationControls from "@/components/bloom/GenerationControls"
import ResultsGrid from "@/components/bloom/ResultsGrid"

export interface BloomGeneratorProps {
  /** Default prompt to pre-fill the input. */
  defaultPrompt?: string
  /** Default aspect ratio. Defaults to "16:9". */
  defaultAspectRatio?: AspectRatio
  /** Default number of variants (1–5). Defaults to 2. */
  defaultVariantCount?: number
  /** Called with image URLs once generation completes successfully. */
  onGenerated?: (urls: string[]) => void
}

/**
 * Self-contained image generator component backed by the Bloom API.
 * Mount it anywhere in your app — it manages its own brand and generation state.
 */
export default function BloomGenerator({
  defaultPrompt = "",
  defaultAspectRatio = "16:9",
  defaultVariantCount = 2,
  onGenerated,
}: BloomGeneratorProps) {
  const [prompt, setPrompt] = useState(defaultPrompt)
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(defaultAspectRatio)
  const [variantCount, setVariantCount] = useState(Math.min(5, Math.max(1, defaultVariantCount)))

  const { brands, loading: brandsLoading, error: brandsError, selectedBrandId, setSelectedBrandId } = useBrandList()
  const { generate, images, loading, error, reset } = useBloom()

  // Fire onGenerated once per completed generation (not on every re-render).
  const wasLoadingRef = useRef(false)
  useEffect(() => {
    const wasLoading = wasLoadingRef.current
    wasLoadingRef.current = loading
    if (wasLoading && !loading && images.length > 0 && error === null) {
      onGenerated?.(images)
    }
  }, [loading, images, error, onGenerated])

  function handleGenerate() {
    const trimmedPrompt = prompt.trim()
    if (!trimmedPrompt || !selectedBrandId) return
    void generate(trimmedPrompt, aspectRatio, variantCount, selectedBrandId)
  }

  return (
    <div className="relative z-[1] mx-auto max-w-[720px]">
      <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
        <GeneratorHeader />

        <div className="space-y-6 px-6 py-6 sm:px-8 sm:py-8">
          <BrandPicker
            brands={brands}
            brandsLoading={brandsLoading}
            brandsError={brandsError}
            generationLoading={loading}
            selectedBrandId={selectedBrandId}
            onSelectBrand={setSelectedBrandId}
          />
          <GenerationControls
            prompt={prompt}
            onPromptChange={setPrompt}
            aspectRatio={aspectRatio}
            onAspectRatioChange={setAspectRatio}
            variantCount={variantCount}
            onVariantCountChange={setVariantCount}
            loading={loading}
            brandsLoading={brandsLoading}
            selectedBrandId={selectedBrandId}
            hasImages={images.length > 0}
            onGenerate={handleGenerate}
            onReset={reset}
          />
        </div>

        <ResultsGrid
          images={images}
          aspectRatio={aspectRatio}
          loading={loading}
          error={error}
        />
      </div>
    </div>
  )
}
