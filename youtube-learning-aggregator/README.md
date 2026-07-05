# YouTube Learning Aggregator

Enter a topic or exam (e.g. "CompTIA Network+", "cybersecurity", "project management") and get back a structured, curated learning path built from real YouTube search results — full courses, fundamentals, tutorials, advanced deep dives, and (for certification-style topics) practice exams and study tips.

## How it works

1. You submit a topic from the UI.
2. The server (`app/api/learning-package/route.ts`) breaks the topic into a handful of targeted sub-searches (`lib/curriculum.ts`), e.g. `"<topic> full course"`, `"<topic> fundamentals explained for beginners"`, `"<topic> tutorial"`, etc. Certification/exam-sounding topics also get practice-exam and exam-tips modules.
3. Each sub-search hits the YouTube Data API v3 (`lib/youtube.ts`) for videos and, for the "full course" module, playlists too.
4. Results are scored (`lib/rank.ts`) using view count, like ratio, channel subscriber count, recency, and how well the video's length fits the module (e.g. full courses favor 30min+ videos, tutorials favor 5–30min).
5. The top-ranked, deduplicated videos/playlists per module are returned and rendered as a study plan, which can be exported to a Markdown study guide.

## Setup

1. Get a free YouTube Data API v3 key:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
   - Create a project (or pick an existing one).
   - Enable the **YouTube Data API v3** under "APIs & Services".
   - Create an API key under "Credentials".
2. Copy `.env.example` to `.env.local` and paste in your key:
   ```bash
   cp .env.example .env.local
   # then edit .env.local and set YOUTUBE_API_KEY=your-key-here
   ```
3. Install dependencies and run the dev server:
   ```bash
   npm install
   npm run dev
   ```
4. Open http://localhost:3000, type a topic, and click "Build My Learning Package".

## Notes / limitations

- The YouTube Data API free tier has a daily quota (10,000 units/day by default). A single learning-package request costs roughly 7 search calls (100 units each) plus a few videos/channels/playlists list calls — so expect to be able to generate on the order of a dozen packages per day on the default quota. The app surfaces a friendly error if the quota is exceeded.
- Module structure is built from template search queries rather than true NLP topic clustering — it's a pragmatic way to get a sensible curriculum shape (fundamentals → tutorials → advanced → exam prep) without needing a curated subject database.
- No video transcripts/summaries are fetched in this version — each entry shows title, channel, duration, views, and recency, which is enough to judge relevance without hitting extra quota/API surface.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript check only
