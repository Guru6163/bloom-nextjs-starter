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
import type { AspectRatio } from "@/lib/bloom"

export type { AspectRatio }

interface UseBloomState {
  images: string[]
  loading: boolean
  error: string | null
}

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

function readJsonError(payload: unknown): string | undefined {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("error" in payload)
  ) {
    return undefined
  }
  const value = (payload as { error: unknown }).error
  return typeof value === "string" ? value : undefined
}

function readGenerateIds(payload: unknown): string[] | null {
  if (typeof payload !== "object" || payload === null || !("ids" in payload)) {
    return null
  }
  const ids = (payload as { ids: unknown }).ids
  if (!Array.isArray(ids)) {
    return null
  }
  if (!ids.every((id): id is string => typeof id === "string")) {
    return null
  }
  return ids
}

function readPollImages(
  payload: unknown
): Array<{ id: string; url: string; status: string }> | null {
  if (
    typeof payload !== "object" ||
    payload === null ||
    !("images" in payload)
  ) {
    return null
  }
  const images = (payload as { images: unknown }).images
  if (!Array.isArray(images)) {
    return null
  }
  const out: Array<{ id: string; url: string; status: string }> = []
  for (const item of images) {
    if (typeof item !== "object" || item === null) {
      return null
    }
    if (!("id" in item) || !("url" in item) || !("status" in item)) {
      return null
    }
    const id = (item as { id: unknown }).id
    const url = (item as { url: unknown }).url
    const status = (item as { status: unknown }).status
    if (
      typeof id !== "string" ||
      typeof url !== "string" ||
      typeof status !== "string"
    ) {
      return null
    }
    out.push({ id, url, status })
  }
  return out
}

export function useBloom(): UseBloomReturn {
  const [images, setImages] = useState<UseBloomState["images"]>([])
  const [loading, setLoading] = useState<UseBloomState["loading"]>(false)
  const [error, setError] = useState<UseBloomState["error"]>(null)

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
        const genRes = await fetch("/api/bloom/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            aspectRatio,
            variantCount,
            ...(brandSessionId
              ? { brandSessionId }
              : {}),
          }),
        })
        const genBody: unknown = await genRes.json()

        if (!genRes.ok) {
          throw new Error(
            readJsonError(genBody) ?? "Generation failed"
          )
        }

        const ids = readGenerateIds(genBody)
        if (!ids) {
          throw new Error("Generation failed")
        }

        const pollRes = await fetch(
          `/api/bloom/poll?ids=${ids.join(",")}`
        )
        const pollBody: unknown = await pollRes.json()

        if (!pollRes.ok) {
          throw new Error(readJsonError(pollBody) ?? "Poll failed")
        }

        const polled = readPollImages(pollBody)
        if (!polled) {
          throw new Error("Poll failed")
        }

        setImages(polled.map((img) => img.url))
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
