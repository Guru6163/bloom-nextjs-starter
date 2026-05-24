/**
 * components/bloom/GeneratorHeader.tsx
 *
 * Static header section for the BloomGenerator card.
 * Renders the Bloom icon, eyebrow label, headline, and tagline.
 *
 * No props — this section never changes based on generator state.
 */

import Image from "next/image"

/** Card header with Bloom branding and generator title. */
export default function GeneratorHeader() {
  return (
    <div className="border-b border-border px-6 py-5 sm:px-8 sm:py-6">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-5">
        <Image
          src="/bloom-icon-512.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0"
        />
        <div className="min-w-0 flex-1 text-left">
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
            Bloom starter
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight text-foreground sm:text-4xl">
            Image generator
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Describe what you need—Bloom keeps it on-brand.
          </p>
        </div>
      </div>
    </div>
  )
}
