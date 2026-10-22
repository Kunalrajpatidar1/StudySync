# PlaylistLength

A responsive YouTube watch-time calculator with a study planner, local watch progress, and iCalendar export.

## Run locally

1. Create a YouTube Data API v3 key in Google Cloud and enable the YouTube Data API v3 for the project.
2. Copy `.env.example` to `.env` and set `VITE_YOUTUBE_API_KEY` to the key.
3. Restrict the key to the YouTube Data API and your local/production HTTP referrers. Vite embeds `VITE_` variables in browser code, so the key is public and must be restricted.
4. Run `npm install`, then `npm run dev`.

Use `npm run build` to type-check and create the production bundle.

## Features

- Playlist, video, and channel-link lookup, with pagination capped at 5,000 playlist items.
- Side-by-side comparison of up to five links, playback-speed calculations, and a configurable daily study plan.
- Per-playlist watched progress stored only in the browser's local storage.
- Google Calendar event drafts for individual sessions, plus a bulk `.ics` import for the full study plan. Every session uses the course name as its event title and lists that day's videos in the event details.

Individual Google Calendar links open a prefilled event draft; sign in if prompted, review the event, and save it. To add the full plan, use **Add all sessions to Google Calendar**, then choose the downloaded `.ics` file on Google Calendar's import page. Google requires importing the file; a Google API key alone cannot write events to a user's calendar. This feature does not require Calendar API or OAuth credentials.
