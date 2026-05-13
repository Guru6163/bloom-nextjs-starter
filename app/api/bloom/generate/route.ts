/**
 * app/api/bloom/generate/route.ts
 *
 * POST /api/bloom/generate
 *
 * Starts image generation for a chosen or default ready brand.
 * Body: { prompt, aspectRatio?, variantCount?, brandSessionId? }
 *
 * If brandSessionId is provided, that brand must be "ready".
 * Otherwise the first ready brand in the account is used.
 */

import { NextRequest, NextResponse } from "next/server"
import {
  generateImages,
  getBrandById,
  getFirstReadyBrand,
  type AspectRatio,
  type Brand,
} from "@/lib/bloom"

const ASPECT_RATIOS: AspectRatio[] = [
  "1:1",
  "2:3",
  "3:2",
  "3:4",
  "4:3",
  "4:5",
  "5:4",
  "9:16",
  "16:9",
  "21:9",
]

function isAspectRatio(value: unknown): value is AspectRatio {
  return (
    typeof value === "string" &&
    (ASPECT_RATIOS as readonly string[]).includes(value)
  )
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.BLOOM_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "BLOOM_API_KEY is not configured" },
      { status: 500 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const prompt =
    "prompt" in body && typeof (body as { prompt: unknown }).prompt === "string"
      ? (body as { prompt: string }).prompt.trim()
      : ""

  if (!prompt) {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    )
  }

  const aspectRaw = (body as { aspectRatio?: unknown }).aspectRatio
  const aspectRatio: AspectRatio = isAspectRatio(aspectRaw)
    ? aspectRaw
    : "16:9"

  const variantRaw = (body as { variantCount?: unknown }).variantCount
  let variantCount = 1
  if (typeof variantRaw === "number" && Number.isInteger(variantRaw)) {
    variantCount = Math.min(5, Math.max(1, variantRaw))
  }

  const brandSessionRaw = (body as { brandSessionId?: unknown })
    .brandSessionId
  const brandSessionId =
    typeof brandSessionRaw === "string" ? brandSessionRaw.trim() : ""

  try {
    let brandSession: Brand

    if (brandSessionId) {
      const brand = await getBrandById(apiKey, brandSessionId)
      if (brand.status !== "ready") {
        return NextResponse.json(
          {
            error: `Brand "${brand.name}" is not ready (status: ${brand.status})`,
          },
          { status: 400 }
        )
      }
      brandSession = brand
    } else {
      const brand = await getFirstReadyBrand(apiKey)
      if (!brand) {
        return NextResponse.json(
          {
            error:
              "No ready brand found. Add a brand in Bloom or pick one that is ready.",
          },
          { status: 400 }
        )
      }
      brandSession = brand
    }

    const ids = await generateImages(
      apiKey,
      brandSession.id,
      prompt,
      aspectRatio,
      variantCount
    )

    return NextResponse.json({ ids }, { status: 202 })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Generation failed",
      },
      { status: 500 }
    )
  }
}
