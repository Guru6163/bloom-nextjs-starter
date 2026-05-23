/**
 * app/api/bloom/brands/route.ts
 *
 * GET /api/bloom/brands
 *
 * Lists brand sessions for the account so the client can show a picker.
 * The API key never leaves the server.
 */

import { NextResponse } from "next/server"
import { listBrands } from "@/lib/bloom"
import {
  toBrandSummary,
  type ApiErrorResponse,
  type BrandsResponse,
} from "@/lib/bloom-api"

export async function GET() {
  const apiKey = process.env.BLOOM_API_KEY
  if (!apiKey) {
    return NextResponse.json<ApiErrorResponse>(
      { error: "BLOOM_API_KEY is not configured" },
      { status: 500 }
    )
  }

  try {
    const { brands } = await listBrands(apiKey, { limit: 50 })
    const payload: BrandsResponse = {
      brands: brands.map(toBrandSummary),
    }
    return NextResponse.json<BrandsResponse>(payload, { status: 200 })
  } catch (err) {
    return NextResponse.json<ApiErrorResponse>(
      {
        error: err instanceof Error ? err.message : "Failed to list brands",
      },
      { status: 500 }
    )
  }
}
