import type { Metadata } from "next"
import Image from "next/image"
import BloomGenerator from "@/components/BloomGenerator"

export const metadata: Metadata = {
  title: "Bloom Next.js Starter",
  description:
    "Generate on-brand images in your Next.js app with the Bloom API.",
}

export default function Home() {
  return (
    <main className="relative z-[1] px-6 pb-20 pt-16 sm:pt-24">
      <div className="mx-auto mb-14 max-w-[1200px] text-center sm:mb-16">
        <a
          href="https://trybloom.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto mb-6 inline-flex items-center justify-center"
          aria-label="Bloom (opens trybloom.ai)"
        >
          <Image
            src="/bloom-icon-512.png"
            alt=""
            width={48}
            height={48}
            priority
            className="h-12 w-12"
          />
        </a>
        <h1 className="font-serif text-4xl leading-[0.95] tracking-[-0.04em] text-foreground sm:text-5xl md:text-6xl">
          Bloom Next.js Starter
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Generate on-brand images in your Next.js app. Clone, add your API
          key, and ship—same workflow as{" "}
          <a
            href="https://trybloom.ai"
            className="font-medium text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-foreground/80"
          >
            trybloom.ai
          </a>
          .
        </p>

        <a
          href="https://github.com/Guru6163/bloom-nextjs-starter"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground/75 transition-colors hover:text-foreground"
        >
          View source on GitHub
          <span aria-hidden className="text-muted-foreground">
            ↗
          </span>
        </a>
      </div>

      <BloomGenerator
        defaultPrompt="A bold product hero image with clean composition"
        defaultAspectRatio="16:9"
        defaultVariantCount={2}
      />

      <p className="mx-auto mt-20 max-w-md text-center text-sm text-muted-foreground">
        Built with{" "}
        <a
          href="https://trybloom.ai"
          className="font-medium text-foreground underline decoration-border underline-offset-4 hover:text-foreground/80"
        >
          Bloom
        </a>{" "}
        — the Brand OS for AI-native teams.
      </p>
    </main>
  )
}
