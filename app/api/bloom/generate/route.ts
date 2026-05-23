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
  type Brand,
} from "@/lib/bloom"
import {
  parseGenerateRequestBody,
  type ApiErrorResponse,
  type GenerateResponse,
} from "@/lib/bloom-api"

export async function POST(request: NextRequest) {
  const apiKey = process.env.BLOOM_API_KEY
  if (!apiKey) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "BLOOM_API_KEY is not configured" },
      { status: 500 }
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json<ApiErrorResponse>(
      { error: "Invalid JSON body" },
      { status: 400 }
    )
  }

  const parsed = parseGenerateRequestBody(body)
  if (!parsed.ok) {
    return NextResponse.json<ApiErrorResponse>(
      { error: parsed.error },
      { status: 400 }
    )
  }

  const { prompt, aspectRatio, variantCount, brandSessionId } = parsed.body

  try {
    let brandSession: Brand

    if (brandSessionId) {
      const brand = await getBrandById(apiKey, brandSessionId)
      if (brand.status !== "ready") {
        return NextResponse.json<ApiErrorResponse>(
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
        return NextResponse.json<ApiErrorResponse>(
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

    return NextResponse.json<GenerateResponse>({ ids }, { status: 202 })
  } catch (err) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: err instanceof Error ? err.message : "Generation failed",
      },
      { status: 500 }
    )
  }
}
