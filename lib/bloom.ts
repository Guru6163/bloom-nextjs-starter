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

  return ((await response.json()) as { data: T }).data;
}

/**
 * Fetches the list of brands for the account.
 * Returns up to 50 brands ordered by creation date.
 * Used by getFirstReadyBrand to find a usable brand session.
 */
export async function listBrands(apiKey: string): Promise<Brand[]> {
  const data = await bloomFetch<{ brands: Brand[] }>(
    apiKey,
    "/brands?limit=50"
  );
  return data.brands;
}

/**
 * Returns the first brand with status "ready", or null if none exist.
 * Falls back to BLOOM_BRAND_SESSION_ID env var if set, which lets
 * developers pin a specific brand without listing all brands on every request.
 */
export async function getFirstReadyBrand(
  apiKey: string
): Promise<Brand | null> {
  const pinnedId = process.env.BLOOM_BRAND_SESSION_ID;
  if (pinnedId) {
    const data = await bloomFetch<{ brand: Brand }>(
      apiKey,
      `/brands/${encodeURIComponent(pinnedId)}`
    );
    return data.brand.status === "ready" ? data.brand : null;
  }

  const brands = await listBrands(apiKey);
  const ready = brands.find((b) => b.status === "ready");
  return ready ?? null;
}

/**
 * Starts an image generation job and returns the image IDs immediately.
 * Generation is asynchronous — call pollImages() to wait for completion.
 * Each variant costs one credit (2K) or two credits (4K).
 */
export async function generateImages(
  apiKey: string,
  brandSessionId: string,
  prompt: string,
  aspectRatio: AspectRatio = "16:9",
  variantCount: number = 1
): Promise<string[]> {
  const data = await bloomFetch<{ ids: string[] }>(
    apiKey,
    "/images/generations",
    {
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
    }
  );
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
