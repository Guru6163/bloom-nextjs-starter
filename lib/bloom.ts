/**
 * lib/bloom.ts
 *
 * Server-side Bloom API client for Next.js.
 *
 * Import this file ONLY from API routes (app/api/**).
 * Never import it from components or hooks — it relies on
 * server-only environment variables and Node.js APIs.
 *
 * All functions accept an apiKey parameter rather than reading
 * from env directly, so they remain testable in isolation.
 */

/**
 * A brand session returned by the Bloom API.
 */
export interface Brand {
  id: string;
  name: string;
  url: string;
  status: "analyzing" | "ready" | "logo_required" | "failed";
  imageCount?: number;
  workspaceId?: string;
  workspaceName?: string;
  createdAt: string;
}

/**
 * An image record from the Bloom API, including generation status and URL.
 */
export interface BloomImage {
  id: string;
  status: "pending" | "generating" | "completed" | "failed";
  imageUrl?: string;
  aspectRatio?: string;
  prompt?: string;
  width?: number;
  height?: number;
  createdAt?: string;
}

/**
 * Supported aspect ratios for image generation.
 */
export type AspectRatio =
  | "1:1"
  | "2:3"
  | "3:2"
  | "3:4"
  | "4:3"
  | "4:5"
  | "5:4"
  | "9:16"
  | "16:9"
  | "21:9";

/**
 * Shared fetch wrapper for all Bloom API requests.
 * Centralises auth headers and error formatting.
 */
async function bloomFetch<T>(
  apiKey: string,
  path: string,
  options?: RequestInit
): Promise<T> {
  const url = `https://www.trybloom.ai/api/v1${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(
      `Bloom API error [${response.status}]: ${bodyText}`
    );
  }

  const json: unknown = await response.json();
  if (
    typeof json !== "object" ||
    json === null ||
    !("data" in json) ||
    (json as { data: unknown }).data === undefined
  ) {
    throw new Error("Bloom API error: response missing data envelope");
  }
  return (json as { data: T }).data;
}

/**
 * Page of brands from GET /brands (cursor pagination per Bloom OpenAPI).
 */
export interface ListBrandsResult {
  brands: Brand[];
  nextCursor?: string;
  hasMore?: boolean;
}

/**
 * Fetches a page of brand sessions (default limit 50, max 100 per API).
 */
export async function listBrands(
  apiKey: string,
  options?: { limit?: number; cursor?: string; workspaceId?: string }
): Promise<ListBrandsResult> {
  const limit = Math.min(100, Math.max(1, options?.limit ?? 50));
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (options?.cursor) {
    params.set("cursor", options.cursor);
  }
  if (options?.workspaceId) {
    params.set("workspaceId", options.workspaceId);
  }
  const data = await bloomFetch<ListBrandsResult>(
    apiKey,
    `/brands?${params.toString()}`
  );
  if (!Array.isArray(data.brands)) {
    throw new Error("Bloom API error: brands list missing or invalid");
  }
  return data;
}

/**
 * Fetches a single brand session by ID (GET /brands/{id}).
 * Response `data` is the brand object per Bloom OpenAPI.
 */
export async function getBrandById(
  apiKey: string,
  brandId: string
): Promise<Brand> {
  return bloomFetch<Brand>(
    apiKey,
    `/brands/${encodeURIComponent(brandId)}`
  );
}

/**
 * Returns the first brand with status "ready", or null if none exist.
 */
export async function getFirstReadyBrand(
  apiKey: string
): Promise<Brand | null> {
  const { brands } = await listBrands(apiKey, { limit: 50 });
  const ready = brands.find((b) => b.status === "ready");
  return ready ?? null;
}

/**
 * Starts an image generation job and returns the image IDs immediately.
 * Generation is asynchronous — call pollImages() to wait for completion.
 * Each variant costs one credit (2K) or two credits (4K).
 * Returns 202 from Bloom; `response.ok` is still true.
 */
export async function generateImages(
  apiKey: string,
  brandSessionId: string,
  prompt: string,
  aspectRatio: AspectRatio = "16:9",
  variantCount: number = 1
): Promise<string[]> {
  const data = await bloomFetch<{
    ids: string[];
    variantGroupId?: string;
    status?: string;
  }>(apiKey, "/images/generations", {
    method: "POST",
    body: JSON.stringify({
      brandSessionId,
      prompt,
      aspectRatio,
      imageSize: "2K",
      model: "fast",
      variantCount,
      referenceImageIds: [],
    }),
  });
  if (!Array.isArray(data.ids) || data.ids.length === 0) {
    throw new Error("Bloom API error: generation response missing ids");
  }
  return data.ids;
}

/**
 * Polls the API until all image IDs reach a terminal status.
 * Uses wait=true so the server holds the connection — no polling loop needed.
 * Throws if any image fails.
 */
export async function pollImages(
  apiKey: string,
  imageIds: string[]
): Promise<BloomImage[]> {
  if (imageIds.length === 0) {
    return [];
  }

  const idsParam = imageIds.join(",");
  const data = await bloomFetch<{ images: BloomImage[] }>(
    apiKey,
    `/images?ids=${idsParam}&wait=true&timeout=120&includeUrls=true`
  );

  if (!Array.isArray(data.images)) {
    throw new Error("Bloom API error: images response missing images array");
  }

  for (const image of data.images) {
    if (image.status === "failed") {
      throw new Error(`Image generation failed for ID: ${image.id}`);
    }
  }

  return data.images;
}

/**
 * Extracts the final image URL from a BloomImage.
 * The imageUrl field is a redirect URL (https://www.trybloom.ai/img/uuid)
 * that resolves to the actual image — safe to use directly in <img src>.
 * Throws if the image is not yet completed.
 */
export function getImageUrl(image: BloomImage): string {
  if (!image.imageUrl) {
    throw new Error(`Image ${image.id} has no URL yet`);
  }
  return image.imageUrl;
}
