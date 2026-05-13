# Bloom Next.js Starter

> A ready-made Next.js 14 app with Bloom pre-wired.
> Clone it, add your API key, and have a working image generator in 5 minutes.

---

## What's included

| File | What it does |
| --- | --- |
| `lib/bloom.ts` | Server-side Bloom API client |
| `app/api/bloom/brands/route.ts` | GET endpoint — list brands for the picker |
| `app/api/bloom/generate/route.ts` | POST endpoint — starts generation |
| `app/api/bloom/poll/route.ts` | GET endpoint — waits for results |
| `hooks/useBloom.ts` | React hook: generate, loading, error, reset |
| `components/BloomGenerator.tsx` | Drop-in generator component |
| `app/page.tsx` | Demo page |

---

## Prerequisites

| Requirement | Version |
| --- | --- |
| Node.js | 18+ |
| Bloom API key | [trybloom.ai/developers](https://trybloom.ai/developers) |

---

## Quick start

```bash
git clone https://github.com/Guru6163/bloom-nextjs-starter
cd bloom-nextjs-starter
npm install
cp .env.local.example .env.local
```

Open `.env.local` and add your key:

```env
BLOOM_API_KEY=bloom_sk_your_key_here
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — pick a ready brand, type a prompt, and generate.

---

## How it works

```text
Browser
  │
  ├─ GET /api/bloom/brands
  │    ↓ lib/bloom.ts → GET /brands?limit=50
  │    ← { brands: [{ id, name, status, url }] }
  │
  ├─ POST /api/bloom/generate  (body includes brandSessionId when using the UI)
  │    ↓ lib/bloom.ts → POST /images/generations
  │    ← { ids: ["uuid1", "uuid2"] }
  │
  └─ GET /api/bloom/poll?ids=uuid1,uuid2
       ↓ lib/bloom.ts → GET /images?ids=...&wait=true
       ← { images: [{ id, url, status }] }
```

`BLOOM_API_KEY` never leaves the server.
The client only talks to `/api/bloom/*` routes.

---

## Drop the component into your own app

```tsx
import BloomGenerator from "@/components/BloomGenerator"

export default function MyPage() {
  return (
    <BloomGenerator
      defaultPrompt="A bold product hero image"
      defaultAspectRatio="16:9"
      defaultVariantCount={2}
      onGenerated={(urls) => console.log(urls)}
    />
  )
}
```

---

## Use the hook directly

```tsx
"use client"
import { useBloom } from "@/hooks/useBloom"

export default function MyComponent() {
  const brandId = "your-ready-brand-session-id" // e.g. from GET /api/bloom/brands

  const { generate, images, loading, error } = useBloom()

  return (
    <button
      onClick={() => generate("summer sale banner", "16:9", 2, brandId)}
    >
      {loading ? "Generating..." : "Generate"}
    </button>
  )
}
```

---

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `BLOOM_API_KEY` | ✅ | Your Bloom API key |

---

## Aspect ratios

| Value | Use case |
| --- | --- |
| `1:1` | Instagram Feed, profile images |
| `4:5` | Instagram Feed (portrait) |
| `9:16` | Instagram Stories, TikTok |
| `16:9` | Website hero, YouTube thumbnail |
| `21:9` | Cinematic banner |

---

## Other Bloom templates

| Template | Repo |
| --- | --- |
| REST API Quickstart | [bloom-restapi-quickstart-template](https://github.com/Guru6163/bloom-restapi-quickstart-template) |
| Slack Bot | [bloom-slack-bot](https://github.com/Guru6163/bloom-slack-bot) |
| Figma Plugin | [bloom-figma](https://github.com/Guru6163/bloom-figma) |
| Canva App | [canva-bloom-plugin](https://github.com/Guru6163/canva-bloom-plugin) |

---

Built with ❤️ for [Bloom](https://trybloom.ai) — the Brand OS for AI-native teams.
