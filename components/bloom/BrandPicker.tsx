/**
 * components/bloom/BrandPicker.tsx
 *
 * Brand session selector for the BloomGenerator form.
 *
 * Shows a <select> populated by useBrandList. Only brands with status
 * "ready" are selectable — brands still analyzing or failed are shown
 * disabled so the user understands why they can't choose them.
 *
 * Fits in: rendered inside the form body of BloomGenerator.tsx.
 */

import type { BrandSummary } from "@/lib/bloom-api"
import { fieldClass } from "./constants"

export interface BrandPickerProps {
  brands: BrandSummary[]
  /** True while the /api/bloom/brands request is in flight. */
  brandsLoading: boolean
  /** Error message from the brands fetch, if any. */
  brandsError: string | null
  /** True while image generation is running (disables this picker). */
  generationLoading: boolean
  selectedBrandId: string
  onSelectBrand: (id: string) => void
}

/**
 * Dropdown for choosing which brand session to generate images for.
 * Disabled during generation and while brands are still loading.
 * Shows an inline error if the brands request fails.
 */
export default function BrandPicker({
  brands,
  brandsLoading,
  brandsError,
  generationLoading,
  selectedBrandId,
  onSelectBrand,
}: BrandPickerProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="bloom-brand" className="text-sm font-medium text-foreground">
        Brand
      </label>
      <select
        id="bloom-brand"
        value={selectedBrandId}
        onChange={(e) => onSelectBrand(e.target.value)}
        disabled={generationLoading || brandsLoading || brands.length === 0}
        className={`${fieldClass} h-9`}
      >
        {brandsLoading ? (
          <option value="">Loading brands…</option>
        ) : brands.length === 0 ? (
          <option value="">No brands found</option>
        ) : (
          brands.map((brand) => (
            <option key={brand.id} value={brand.id} disabled={brand.status !== "ready"}>
              {brand.name} — {brand.status}
            </option>
          ))
        )}
      </select>

      {brandsError && (
        <p className="text-xs text-destructive">{brandsError}</p>
      )}

      {!brandsLoading && !brandsError && brands.length > 0 && !brands.some((b) => b.status === "ready") && (
        <p className="text-xs text-muted-foreground">
          No brand is ready yet. Finish onboarding in Bloom, then refresh this page.
        </p>
      )}
    </div>
  )
}
