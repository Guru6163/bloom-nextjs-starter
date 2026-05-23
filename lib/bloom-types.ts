/**
 * lib/bloom-types.ts
 *
 * TypeScript types aligned with the Bloom OpenAPI spec:
 * https://www.trybloom.ai/api/v1/spec.json
 *
 * Safe to import from client and server code.
 */

/** GET /brands list item and GET /brands/{id} status */
export type BrandStatus =
  | "analyzing"
  | "ready"
  | "logo_required"
  | "failed";

/** POST /brands response status */
export type BrandCreateStatus = "analyzing" | "logo_required";

/** POST /brands/{id}/logo response status */
export type BrandLogoUpdateStatus = "analyzing" | "ready";

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
] as const satisfies readonly AspectRatio[];

export type ImageSize = "2K" | "4K";

export type GenerationModel = "fast" | "standard" | "pro";

export type ImageSource = "generated" | "uploaded" | "scraped";

export type ImageStatus = "pending" | "generating" | "completed" | "failed";

export type ImageActionType =
  | "generation"
  | "edit"
  | "resize"
  | "variant"
  | "recreate";

/** GET /account */
export interface Account {
  email: string;
  name: string | null;
}

/** GET /brands list item */
export interface BrandListItem {
  id: string;
  name: string;
  url: string;
  status: BrandStatus;
  imageCount: number;
  workspaceId: string | null;
  workspaceName: string;
  createdAt: string;
}

/** GET /brands/{id} */
export interface BrandDetail {
  id: string;
  status: BrandStatus;
  name: string;
  url: string;
  logoUrl: string | null;
  logoError?: string;
  colors: string[];
  fonts: string[];
  aesthetic: string | null;
  summary: string | null;
  workspaceId: string | null;
  workspaceName: string;
  createdAt: string;
}

/** GET /brands */
export interface ListBrandsResult {
  brands: BrandListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** POST /brands */
export interface CreateBrandRequest {
  url: string;
  workspaceId?: string;
  logoUrl?: string;
}

export interface CreateBrandResult {
  id: string;
  status: BrandCreateStatus;
  logoError?: string;
}

/** GET /images list item and GET /images/{id} */
export interface BloomImage {
  id: string;
  source: ImageSource;
  brandSessionId?: string;
  prompt: string | null;
  description: string | null;
  aspectRatio: AspectRatio | null;
  width: number | null;
  height: number | null;
  actionType: ImageActionType | null;
  variantGroupId: string | null;
  status: ImageStatus | null;
  imageUrl?: string | null;
  workspaceId: string | null;
  workspaceName: string;
  createdAt: string;
}

/** GET /images */
export interface ListImagesResult {
  images: BloomImage[];
  nextCursor: string | null;
  hasMore: boolean;
}

/** POST /images/generations request body */
export interface GenerateImagesRequest {
  prompt: string;
  brandSessionId: string;
  aspectRatio?: AspectRatio;
  imageSize?: ImageSize;
  model?: GenerationModel;
  variantCount?: number;
  referenceImageIds?: string[];
}

/** POST /images/generations response data */
export interface GenerateImagesResult {
  ids: string[];
  variantGroupId: string | null;
  status: "pending";
}

/** GET /credits */
export interface CreditBalance {
  balance: number;
  unlimited: boolean;
}

/** GET /workspaces list item */
export interface Workspace {
  id: string | null;
  name: string;
}

export interface ListWorkspacesResult {
  workspaces: Workspace[];
}

/** Standard Bloom success envelope */
export interface BloomApiEnvelope<T> {
  data: T;
}
