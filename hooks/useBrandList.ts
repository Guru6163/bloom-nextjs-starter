"use client"

/**
 * hooks/useBrandList.ts
 *
 * Loads brand sessions from GET /api/bloom/brands for the generator UI.
 *
 * Why it exists: keeps brand-fetch logic out of BloomGenerator so the
 * component stays focused on layout and generation flow.
 *
 * Fits in: used by components/BloomGenerator.tsx on mount.
 */

import { useEffect, useState } from "react"
import { parseApiError, parseBrandsResponse, type BrandSummary } from "@/lib/bloom-api"

export interface UseBrandListReturn {
  brands: BrandSummary[]
  loading: boolean
  error: string | null
  /** ID of the first brand with status "ready", or "" if none. */
  selectedBrandId: string
  setSelectedBrandId: (id: string) => void
}

/**
 * Fetches brands on mount and auto-selects the first ready brand.
 *
 * @returns Brand list state, loading/error flags, and selected brand ID.
 * Edge case: if no brand is "ready", selectedBrandId stays "" and the
 * caller should disable generation until the user finishes Bloom onboarding.
 */
export function useBrandList(): UseBrandListReturn {
  const [brands, setBrands] = useState<BrandSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBrandId, setSelectedBrandId] = useState("")

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/bloom/brands")
        const payload: unknown = await response.json()
        if (!response.ok) {
          throw new Error(parseApiError(payload) ?? "Failed to load brands")
        }
        const brandsResponse = parseBrandsResponse(payload)
        if (!brandsResponse) {
          throw new Error("Invalid brands response")
        }
        if (cancelled) {
          return
        }
        setBrands(brandsResponse.brands)
        const firstReady = brandsResponse.brands.find((b) => b.status === "ready")
        setSelectedBrandId(firstReady?.id ?? "")
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load brands")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return { brands, loading, error, selectedBrandId, setSelectedBrandId }
}
