/**
 * components/bloom/GenerationControls.tsx
 *
 * Prompt input, aspect ratio selector, variant count selector, and
 * the Generate / Clear buttons for the BloomGenerator form.
 *
 * All state is lifted to BloomGenerator — this component is purely
 * presentational, making it easy to test in isolation or swap out.
 *
 * Fits in: rendered inside the form body of BloomGenerator.tsx,
 * below BrandPicker.
 */

import type { AspectRatio } from "@/lib/bloom-api"
import { ASPECT_RATIOS, fieldClass, primaryBtnClass, ghostBtnClass } from "./constants"

export interface GenerationControlsProps {
  prompt: string
  onPromptChange: (value: string) => void
  aspectRatio: AspectRatio
  onAspectRatioChange: (value: AspectRatio) => void
  variantCount: number
  onVariantCountChange: (value: number) => void
  /** True while image generation is in flight. */
  loading: boolean
  /** True while the brands list is still loading (keeps Generate disabled). */
  brandsLoading: boolean
  /** The currently selected brand session ID (empty string = none selected). */
  selectedBrandId: string
  /** True when there are results to clear. */
  hasImages: boolean
  onGenerate: () => void
  onReset: () => void
}

/** Clamps variant count to the range [1, 5] supported by the Bloom API. */
function clampVariantCount(n: number): number {
  return Math.min(5, Math.max(1, n))
}

/**
 * Form controls for configuring and triggering image generation.
 * Generate is disabled until a prompt is entered and a brand is selected.
 */
export default function GenerationControls({
  prompt,
  onPromptChange,
  aspectRatio,
  onAspectRatioChange,
  variantCount,
  onVariantCountChange,
  loading,
  brandsLoading,
  selectedBrandId,
  hasImages,
  onGenerate,
  onReset,
}: GenerationControlsProps) {
  const canGenerate = !!prompt.trim() && !!selectedBrandId && !brandsLoading

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="bloom-prompt" className="text-sm font-medium text-foreground">
          Prompt
        </label>
        <textarea
          id="bloom-prompt"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="e.g. summer sale hero, soft daylight, product front and center"
          rows={4}
          disabled={loading}
          className={`${fieldClass} min-h-[108px] resize-y md:text-sm`}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="bloom-aspect" className="text-sm font-medium text-foreground">
            Aspect ratio
          </label>
          <select
            id="bloom-aspect"
            value={aspectRatio}
            onChange={(e) => onAspectRatioChange(e.target.value as AspectRatio)}
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
          <label htmlFor="bloom-variants" className="text-sm font-medium text-foreground">
            Variants
          </label>
          <select
            id="bloom-variants"
            value={variantCount}
            onChange={(e) => onVariantCountChange(clampVariantCount(Number(e.target.value)))}
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
            onClick={onGenerate}
            disabled={loading || !canGenerate}
            className={primaryBtnClass}
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
          {hasImages && !loading && (
            <button type="button" onClick={onReset} className={ghostBtnClass}>
              Clear results
            </button>
          )}
        </div>
        <p className="text-xs text-muted-foreground sm:max-w-[220px] sm:text-right">
          First run can take ~30s while images finish.
        </p>
      </div>
    </>
  )
}
