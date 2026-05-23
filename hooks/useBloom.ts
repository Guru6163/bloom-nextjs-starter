"use client"

/**
 * hooks/useBloom.ts
 *
 * React hook for generating on-brand images with the Bloom API.
 *
 * Handles the full generate → poll flow, keeping all async
 * logic out of components. The API key stays server-side —
 * this hook only talks to /api/bloom/* routes.
 *
 * Usage:
 *   const { generate, images, loading, error, reset } = useBloom()
 *   await generate("summer sale hero", "16:9", 2, brandSessionId)
 */

import { useState, useCallback } from "react"
import {
  parseApiError,
  parseGenerateResponse,
  parsePollResponse,
  type AspectRatio,
  type GenerateRequestBody,
} from "@/lib/bloom-api"

export type { AspectRatio }

export interface UseBloomReturn {
  images: string[]
  loading: boolean
  error: string | null
  /**
   * Starts generation and polls until images are ready.
   * Resolves when all images are complete.
   * Rejects (and sets error state) on API or network failure.
   */
  generate: (
    prompt: string,
    aspectRatio?: AspectRatio,
    variantCount?: number,
    /** Bloom brand session ID (must be status "ready"). If omitted, the API uses the first ready brand. */
    brandSessionId?: string
  ) => Promise<void>
  /** Clears images and error state to allow a fresh generation. */
  reset: () => void
}

export function useBloom(): UseBloomReturn {
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(
    async (
      prompt: string,
      aspectRatio: AspectRatio = "16:9",
      variantCount: number = 1,
      brandSessionId?: string
    ): Promise<void> => {
      setLoading(true)
      setError(null)
      setImages([])

      try {
        const requestBody: GenerateRequestBody = {
          prompt,
          aspectRatio,
          variantCount,
          ...(brandSessionId ? { brandSessionId } : {}),
        }

        const genRes = await fetch("/api/bloom/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
        const genBody: unknown = await genRes.json()

        if (!genRes.ok) {
          throw new Error(parseApiError(genBody) ?? "Generation failed")
        }

        const generateResponse = parseGenerateResponse(genBody)
        if (!generateResponse) {
          throw new Error("Generation failed")
        }

        const pollRes = await fetch(
          `/api/bloom/poll?ids=${generateResponse.ids.join(",")}`
        )
        const pollBody: unknown = await pollRes.json()

        if (!pollRes.ok) {
          throw new Error(parseApiError(pollBody) ?? "Poll failed")
        }

        const pollResponse = parsePollResponse(pollBody)
        if (!pollResponse) {
          throw new Error("Poll failed")
        }

        setImages(pollResponse.images.map((img) => img.url))
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        )
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reset = useCallback(() => {
    setImages([])
    setError(null)
  }, [])

  return { images, loading, error, generate, reset }
}
