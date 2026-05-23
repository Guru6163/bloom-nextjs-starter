/**
 * app/api/bloom/wait/route.ts
 *
 * GET /api/bloom/wait?ids=uuid1,uuid2
 *
 * Waits for Bloom generation results using wait=true, which holds
 * the server-side connection until all images complete.
 * The client makes one fetch call and blocks until done.
 *
 * Called by: hooks/useBloom.ts
 * Depends on: lib/bloom.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { waitForImages, getImageUrl } from "@/lib/bloom"
import type { ApiErrorResponse, WaitImagesResponse } from "@/lib/bloom-api"

export async function GET(request: NextRequest) {
  const apiKey = process.env.BLOOM_API_KEY
  if (!apiKey) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "BLOOM_API_KEY is not configured" },
      { status: 500 }
    )
  }

  const idsParam = request.nextUrl.searchParams.get("ids")
  if (idsParam === null || idsParam.trim() === "") {
    return NextResponse.json<ApiErrorResponse>(
      { error: "ids query parameter is required" },
      { status: 400 }
    )
  }

  const ids = idsParam
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)

  if (ids.length === 0 || ids.length > 50) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: "ids must be a comma-separated list of up to 50 UUIDs",
      },
      { status: 400 }
    )
  }

  try {
    const completedImages = await waitForImages(apiKey, ids)
    const images: WaitImagesResponse["images"] = completedImages.map((img) => ({
      id: img.id,
      url: getImageUrl(img),
      status: "completed" as const,
    }))
    return NextResponse.json<WaitImagesResponse>({ images }, { status: 200 })
  } catch (err) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: err instanceof Error ? err.message : "Wait for images failed",
      },
      { status: 500 }
    )
  }
}
