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

export async function GET() {
  const apiKey = process.env.BLOOM_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: "BLOOM_API_KEY is not configured" },
      { status: 500 }
    )
  }

  try {
    const brands = await listBrands(apiKey)
    const payload = brands.map((b) => ({
      id: b.id,
      name: b.name,
      url: b.url,
      status: b.status,
    }))
    return NextResponse.json({ brands: payload }, { status: 200 })
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to list brands",
      },
      { status: 500 }
    )
  }
}
