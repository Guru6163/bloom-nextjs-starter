/**
 * app/api/bloom/poll/route.ts
 *
 * GET /api/bloom/poll?ids=uuid1,uuid2
 *
 * Polls Bloom for generation results using wait=true, which holds
 * the server-side connection until all images complete.
 * The client makes one fetch call and waits — no polling loop needed.
 *
 * Called by: hooks/useBloom.ts
 * Depends on: lib/bloom.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { pollImages, getImageUrl } from "@/lib/bloom"
import type { ApiErrorResponse, PollResponse } from "@/lib/bloom-api"

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
    const polledImages = await pollImages(apiKey, ids)
    const images: PollResponse["images"] = polledImages.map((img) => ({
      id: img.id,
      url: getImageUrl(img),
      status: "completed" as const,
    }))
    return NextResponse.json<PollResponse>({ images }, { status: 200 })
  } catch (err) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: err instanceof Error ? err.message : "Poll failed",
      },
      { status: 500 }
    )
  }
}
