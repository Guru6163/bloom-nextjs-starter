import type { Metadata } from "next"
import BloomGenerator from "@/components/BloomGenerator"

export const metadata: Metadata = {
  title: "Bloom Next.js Starter",
  description:
    "Generate on-brand images in your Next.js app with the Bloom API.",
}

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-16">
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="mb-3 text-4xl font-bold text-white">
          Bloom Next.js Starter
        </h1>
        <p className="text-lg text-zinc-400">
          Generate on-brand images in your Next.js app. Clone, add your API
          key, and ship.
        </p>

        <a
          href="https://github.com/Guru6163/bloom-nextjs-starter"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block text-sm text-zinc-500 underline hover:text-zinc-300"
        >
          View source on GitHub
        </a>
      </div>

      <BloomGenerator
        defaultPrompt="A bold product hero image with clean composition"
        defaultAspectRatio="16:9"
        defaultVariantCount={2}
      />

      <p className="mt-16 text-center text-sm text-zinc-600">
        Built with{" "}
        <a href="https://trybloom.ai" className="underline hover:text-zinc-400">
          Bloom
        </a>{" "}
        — the Brand OS for AI-native teams.
      </p>
    </main>
  )
}
