/**
 * lib/bloom-api.ts
 *
 * Shared types and parsers for the app's internal /api/bloom/* routes.
 * Safe to import from client components and hooks.
 */

import type { AspectRatio, Brand } from "@/lib/bloom"

export type { AspectRatio }

export const ASPECT_RATIOS = [
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
] as const satisfies readonly AspectRatio[]

export type BrandSummary = Pick<Brand, "id" | "name" | "url" | "status">

export interface ApiErrorResponse {
  error: string
}

export interface GenerateRequestBody {
  prompt: string
  aspectRatio?: AspectRatio
  variantCount?: number
  brandSessionId?: string
}

export interface ParsedGenerateRequest {
  prompt: string
  aspectRatio: AspectRatio
  variantCount: number
  brandSessionId: string
}

export interface GenerateResponse {
  ids: string[]
}

export interface PollImageResult {
  id: string
  url: string
  status: "completed"
}

export interface PollResponse {
  images: PollImageResult[]
}

export interface BrandsResponse {
  brands: BrandSummary[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

const BRAND_STATUSES = new Set<BrandSummary["status"]>([
  "analyzing",
  "ready",
  "logo_required",
  "failed",
])

export function isAspectRatio(value: unknown): value is AspectRatio {
  return (
    typeof value === "string" &&
    (ASPECT_RATIOS as readonly string[]).includes(value)
  )
}

export function parseApiError(payload: unknown): string | undefined {
  if (!isRecord(payload) || typeof payload.error !== "string") {
    return undefined
  }
  return payload.error
}

export function parseGenerateRequestBody(
  body: unknown
):
  | { ok: true; body: ParsedGenerateRequest }
  | { ok: false; error: string } {
  if (!isRecord(body)) {
    return { ok: false, error: "Invalid body" }
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : ""
  if (!prompt) {
    return { ok: false, error: "prompt is required" }
  }

  const aspectRatio = isAspectRatio(body.aspectRatio) ? body.aspectRatio : "16:9"

  let variantCount = 1
  if (
    typeof body.variantCount === "number" &&
    Number.isInteger(body.variantCount)
  ) {
    variantCount = Math.min(5, Math.max(1, body.variantCount))
  }

  const brandSessionId =
    typeof body.brandSessionId === "string" ? body.brandSessionId.trim() : ""

  return {
    ok: true,
    body: { prompt, aspectRatio, variantCount, brandSessionId },
  }
}

export function parseGenerateResponse(
  payload: unknown
): GenerateResponse | null {
  if (!isRecord(payload) || !Array.isArray(payload.ids)) {
    return null
  }
  if (!payload.ids.every((id): id is string => typeof id === "string")) {
    return null
  }
  return { ids: payload.ids }
}

export function parsePollResponse(payload: unknown): PollResponse | null {
  if (!isRecord(payload) || !Array.isArray(payload.images)) {
    return null
  }

  const images: PollImageResult[] = []
  for (const item of payload.images) {
    if (!isRecord(item)) {
      return null
    }
    if (
      typeof item.id !== "string" ||
      typeof item.url !== "string" ||
      item.status !== "completed"
    ) {
      return null
    }
    images.push({ id: item.id, url: item.url, status: "completed" })
  }

  return { images }
}

export function parseBrandsResponse(payload: unknown): BrandsResponse | null {
  if (!isRecord(payload) || !Array.isArray(payload.brands)) {
    return null
  }

  const brands: BrandSummary[] = []
  for (const item of payload.brands) {
    if (!isRecord(item)) {
      return null
    }
    if (
      typeof item.id !== "string" ||
      typeof item.name !== "string" ||
      typeof item.url !== "string" ||
      typeof item.status !== "string" ||
      !BRAND_STATUSES.has(item.status as BrandSummary["status"])
    ) {
      return null
    }
    brands.push({
      id: item.id,
      name: item.name,
      url: item.url,
      status: item.status as BrandSummary["status"],
    })
  }

  return { brands }
}

export function toBrandSummary(brand: Brand): BrandSummary {
  return {
    id: brand.id,
    name: brand.name,
    url: brand.url,
    status: brand.status,
  }
}
