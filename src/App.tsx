import { FormEvent, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDown, ArrowRight, ArrowUpRight, BookmarkCheck, CalendarDays, Check,
  ChevronDown, Clock3, Code2, Gauge, Github, GraduationCap,
  ListChecks, LoaderCircle, Moon, Play, Plus, Search, Sparkles, Sun, Timer,
  Youtube, Zap,
} from "lucide-react";

type Video = { id: string; title: string; duration: number; thumbnail: string; unavailable?: boolean };
type Playlist = { id: string; title: string; channel: string; thumbnail: string; videos: Video[] };
type StudyDay = { date: Date; videos: Video[]; duration: number; marathon: boolean };
type Mode = "playlist" | "video" | "channel";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;
const speeds = [1, 1.25, 1.5, 1.75, 2];
const examples = [
  { label: "CS50P · Harvard", id: "PLhQjrBD2T3817j24-GogXmWqO5Q5vYy0V" },
  { label: "MIT 6.100L", id: "PLUl4u3cNGP63WbdFxL8giv4yhgdMGaZNA" },
  { label: "C++ DSA", id: "PL_c9BZzLwBRKKqOc9TJz1pP0ASrxLMG7e" },
];

const parseDuration = (value: string) => {
  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  return match ? Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0) : 0;
};

function formatDuration(seconds: number, compact = false) {
  const safe = Math.max(0, Math.round(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (compact) return h ? `${h}h ${m}m` : `${m}m`;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatDate(date: Date, options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

function localToday() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function AnimatedDuration({ seconds }: { seconds: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let frame = 0;
    const started = performance.now();
    const duration = 900;
    const animate = (now: number) => {
      const progress = Math.min(1, (now - started) / duration);
      setDisplayed(Math.round(seconds * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [seconds]);
  return <>{formatDuration(displayed, true)}</>;
}

function resolveInput(input: string): { mode: Mode; value: string } {
  const raw = input.trim();
  if (!raw) throw new Error("Paste a YouTube playlist, video, or channel link to get started.");
  try {
    const url = new URL(raw.startsWith("@") ? `https://youtube.com/${raw}` : /^(?:PL|UU|LL|RD|OLAK5uy_|FL|WL)[\w-]+$/.test(raw) ? `https://youtube.com/playlist?list=${raw}` : raw.includes("://") ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host) && !host.endsWith(".youtube.com")) throw new Error();
    const playlistId = url.searchParams.get("list");
    if (playlistId) return { mode: "playlist", value: playlistId };
    const videoId = host === "youtu.be" ? url.pathname.split("/").filter(Boolean)[0] : url.searchParams.get("v");
    if (videoId && /^[\w-]{11}$/.test(videoId)) return { mode: "video", value: videoId };
    const handle = url.pathname.match(/^\/(@[^/]+)/)?.[1];
    if (handle) return { mode: "channel", value: handle.slice(1) };
    const channelId = url.pathname.match(/^\/channel\/(UC[\w-]+)/)?.[1];
    if (channelId) return { mode: "channel", value: channelId };
    throw new Error();
  } catch {
    throw new Error("That link doesn't look right. Try a YouTube playlist, video, @channel, or playlist ID.");
  }
}

async function youtubeRequest<T>(path: string, params: Record<string, string>) {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries({ ...params, key: API_KEY || "" }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url);
  const body = await response.json() as { error?: { message?: string; errors?: { reason?: string }[] } } & T;
  if (!response.ok) {
    const reason = body.error?.errors?.[0]?.reason;
    if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") throw new Error("YouTube's daily API quota has been reached. Please try again later.");
    if (response.status === 403) throw new Error("This playlist may be private or unavailable. Check the sharing settings and try again.");
    throw new Error(body.error?.message || "YouTube couldn't load that link. Please try again.");
  }
  return body;
}

async function loadPlaylist(input: string): Promise<Playlist> {
  if (!API_KEY) throw new Error("Add your YouTube Data API key to .env as VITE_YOUTUBE_API_KEY, then restart the app.");
  const { mode, value } = resolveInput(input);
  let playlistId = value;
  let title = "";
  let channel = "";
  let thumbnail = "";
  if (mode === "channel") {
    const query: Record<string, string> = value.startsWith("UC") ? { id: value } : { forHandle: value };
    const data = await youtubeRequest<{ items?: { id: string; snippet: { title: string; thumbnails?: { medium?: { url: string } } }; contentDetails: { relatedPlaylists: { uploads: string } } }[] }>("channels", { part: "snippet,contentDetails", ...query });
    const item = data.items?.[0];
    if (!item) throw new Error("We couldn't find that channel. Check the handle and try again.");
    playlistId = item.contentDetails.relatedPlaylists.uploads;
    title = `${item.snippet.title} · uploads`;
    channel = item.snippet.title;
    thumbnail = item.snippet.thumbnails?.medium?.url || "";
  }

  let videos: Video[] = [];
  if (mode === "video") {
    const data = await youtubeRequest<{ items?: { id: string; snippet: { title: string; channelTitle: string; thumbnails?: { medium?: { url: string } } }; contentDetails: { duration: string } }[] }>("videos", { part: "snippet,contentDetails", id: value });
    const item = data.items?.[0];
    if (!item) throw new Error("That video is unavailable or private.");
    title = item.snippet.title;
    channel = item.snippet.channelTitle;
    thumbnail = item.snippet.thumbnails?.medium?.url || "";
    videos = [{ id: item.id, title: item.snippet.title, duration: parseDuration(item.contentDetails.duration), thumbnail }];
    playlistId = `video-${item.id}`;
  } else {
    if (!title) {
      const data = await youtubeRequest<{ items?: { snippet: { title: string; channelTitle: string; thumbnails?: { medium?: { url: string } } } }[] }>("playlists", { part: "snippet", id: playlistId });
      const item = data.items?.[0];
      if (!item) throw new Error("We couldn't find that playlist. It may be private, deleted, or invalid.");
      title = item.snippet.title;
      channel = item.snippet.channelTitle;
      thumbnail = item.snippet.thumbnails?.medium?.url || "";
    }
    const ids: string[] = [];
    let pageToken = "";
    do {
      const data = await youtubeRequest<{ nextPageToken?: string; items?: { snippet: { title: string; thumbnails?: { medium?: { url: string } }; resourceId?: { videoId?: string } } }[] }>("playlistItems", {
        part: "snippet", playlistId, maxResults: "50", ...(pageToken ? { pageToken } : {}),
      });
      for (const item of (data.items || []).slice(0, 5000 - videos.length)) {
        const id = item.snippet.resourceId?.videoId;
        ids.push(id || "");
        videos.push({ id: id || `unavailable-${videos.length}`, title: item.snippet.title || "Unavailable video", duration: 0, thumbnail: item.snippet.thumbnails?.medium?.url || "", unavailable: !id });
      }
      pageToken = data.nextPageToken || "";
    } while (pageToken && videos.length < 5000);
    for (let index = 0; index < ids.length; index += 50) {
      const batch = ids.slice(index, index + 50).filter(Boolean);
      if (!batch.length) continue;
      const data = await youtubeRequest<{ items?: { id: string; contentDetails: { duration: string } }[] }>("videos", { part: "contentDetails", id: batch.join(",") });
      const durationById = new Map((data.items || []).map((item) => [item.id, parseDuration(item.contentDetails.duration)]));
      videos.slice(index, index + 50).forEach((video) => {
        if (!video.unavailable) {
          const duration = durationById.get(video.id);
          if (duration === undefined) video.unavailable = true;
          else video.duration = duration;
        }
      });
    }
  }
  return { id: playlistId, title, channel, thumbnail, videos };
}

function createSchedule(videos: Video[], budget: number, speed: number, startDate: string, skipWeekends: boolean): StudyDay[] {
  const available = videos.filter((video) => !video.unavailable);
  const scaled = available.map((video) => ({ ...video, duration: Math.ceil(video.duration / speed) }));
  const total = scaled.reduce((sum, video) => sum + video.duration, 0);
  if (!scaled.length) return [];
  const ideal = total / Math.max(1, Math.ceil(total / budget));
  const days: StudyDay[] = [];
  let current: Video[] = [];
  let currentDuration = 0;
  let date = new Date(`${startDate}T12:00:00`);
  const pushDay = (marathon = false) => {
    if (!current.length) return;
    while (skipWeekends && (date.getDay() === 0 || date.getDay() === 6)) date.setDate(date.getDate() + 1);
    days.push({ date: new Date(date), videos: current, duration: currentDuration, marathon });
    current = [];
    currentDuration = 0;
    date.setDate(date.getDate() + 1);
  };
  for (const video of scaled) {
    if (video.duration > budget) {
      pushDay();
      current = [video];
      currentDuration = video.duration;
      pushDay(true);
      continue;
    }
    if (current.length && (currentDuration + video.duration > budget || (currentDuration >= ideal && currentDuration + video.duration > ideal))) pushDay();
    current.push(video);
    currentDuration += video.duration;
  }
  pushDay();
  return days;
}

function escapeIcs(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function exportCalendar(playlist: Playlist, days: StudyDay[], startTime: string, reminder: number) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const stamp = (date: Date) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}00`;
  const events = days.map((day) => {
    const start = new Date(day.date);
    start.setHours(hours, minutes, 0, 0);
    const end = new Date(start.getTime() + day.duration * 1000);
    const title = playlist.title;
    const description = day.videos.map((video) => `${video.title} (${formatDuration(video.duration)})\nhttps://www.youtube.com/watch?v=${video.id}`).join("\n\n");
    return `BEGIN:VEVENT\r\nUID:${crypto.randomUUID()}@playlistlength.app\r\nDTSTAMP:${stamp(new Date())}\r\nDTSTART:${stamp(start)}\r\nDTEND:${stamp(end)}\r\nSUMMARY:${escapeIcs(title)}\r\nDESCRIPTION:${escapeIcs(description)}\r\nBEGIN:VALARM\r\nTRIGGER:-PT${reminder}M\r\nACTION:DISPLAY\r\nDESCRIPTION:Study session reminder\r\nEND:VALARM\r\nEND:VEVENT`;
  }).join("\r\n");
  const file = new Blob([`BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//PlaylistLength//Study Plan//EN\r\nCALSCALE:GREGORIAN\r\n${events}\r\nEND:VCALENDAR`], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(file);
  link.download = `${playlist.title.replace(/[^\w-]+/g, "-").slice(0, 60) || "study-plan"}.ics`;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function importAllSessions(playlist: Playlist, days: StudyDay[], startTime: string, reminder: number) {
  window.open("https://calendar.google.com/calendar/u/0/r/settings/import", "_blank", "noopener,noreferrer");
  exportCalendar(playlist, days, startTime, reminder);
}

function googleCalendarEventUrl(playlist: Playlist, day: StudyDay, startTime: string) {
  const [hours, minutes] = startTime.split(":").map(Number);
  const start = new Date(day.date);
  start.setHours(hours, minutes, 0, 0);
  const end = new Date(start.getTime() + day.duration * 1000);
  const calendarStamp = (date: Date) => `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}T${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}00`;
  const title = playlist.title;
  const description = day.videos.map((video) => `${video.title} (${formatDuration(video.duration)})\nhttps://www.youtube.com/watch?v=${video.id}`).join("\n\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${calendarStamp(start)}/${calendarStamp(end)}`,
    details: description,
    ctz: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function Glass({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`glass ${className}`} {...props}>{children}</div>;
}

function App() {
  const [dark, setDark] = useState(true);
  const routeMatch = window.location.pathname.match(/^\/(playlist|video|channel)\/([^/]+)/);
  const initialQuery = routeMatch
    ? routeMatch[1] === "video"
      ? `https://youtube.com/watch?v=${decodeURIComponent(routeMatch[2])}`
      : routeMatch[1] === "channel"
        ? routeMatch[2].startsWith("UC") ? `https://youtube.com/channel/${routeMatch[2]}` : `https://youtube.com/@${decodeURIComponent(routeMatch[2])}`
        : decodeURIComponent(routeMatch[2])
    : "";
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [speed, setSpeed] = useState(1);
  const [customSpeed, setCustomSpeed] = useState(1);
  const [hoursPerDay, setHoursPerDay] = useState(1);
  const [minutesPerSession, setMinutesPerSession] = useState(60);
  const [startDate, setStartDate] = useState(localToday);
  const [skipWeekends, setSkipWeekends] = useState(false);
  const [completion, setCompletion] = useState(100);
  const [startTime, setStartTime] = useState("09:00");
  const [reminder, setReminder] = useState(15);
  const [filter, setFilter] = useState("");
  const [watched, setWatched] = useState<Record<string, string[]>>({});
  const [scheduledWatched, setScheduledWatched] = useState<Record<string, string[]>>({});
  const [reschedulePreview, setReschedulePreview] = useState(false);
  const [toast, setToast] = useState("");
  const [faq, setFaq] = useState<number | null>(null);

  const active = results[0];
  const storageKey = active ? `playlistlength-watched-${active.id}` : "";
  const watchedIds = active ? watched[active.id] || [] : [];
  const currentSpeed = speed === -1 ? customSpeed : speed;
  const watchable = active?.videos.filter((video) => !video.unavailable) || [];
  const watchedDuration = watchable.filter((video) => watchedIds.includes(video.id)).reduce((sum, video) => sum + video.duration, 0);
  const totalDuration = watchable.reduce((sum, video) => sum + video.duration, 0);
  const remaining = totalDuration - watchedDuration;
  const currentProgress = active ? watched[active.id] || [] : [];
  const scheduledProgress = active ? scheduledWatched[active.id] || [] : [];
  const progressChanged = currentProgress.length !== scheduledProgress.length || currentProgress.some((id) => !scheduledProgress.includes(id));
  const playlistDays = useMemo(() => {
    if (!active) return [];
    const count = Math.ceil(watchable.length * completion / 100);
    const remainingVideos = watchable.slice(0, count).filter((video) => !scheduledProgress.includes(video.id));
    return createSchedule(remainingVideos, Math.min(hoursPerDay * 3600, minutesPerSession * 60), currentSpeed, startDate, skipWeekends);
  }, [active, watchable, scheduledProgress, completion, hoursPerDay, minutesPerSession, currentSpeed, startDate, skipWeekends]);
  const previewDays = useMemo(() => {
    if (!active) return [];
    const count = Math.ceil(watchable.length * completion / 100);
    const remainingVideos = watchable.slice(0, count).filter((video) => !currentProgress.includes(video.id));
    return createSchedule(remainingVideos, Math.min(hoursPerDay * 3600, minutesPerSession * 60), currentSpeed, startDate, skipWeekends);
  }, [active, watchable, currentProgress, completion, hoursPerDay, minutesPerSession, currentSpeed, startDate, skipWeekends]);
  const visibleVideos = active?.videos.filter((video) => video.title.toLowerCase().includes(filter.toLowerCase())) || [];

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      const ids = saved ? JSON.parse(saved) as string[] : [];
      setWatched((previous) => ({ ...previous, [active!.id]: ids }));
      setScheduledWatched((previous) => ({ ...previous, [active!.id]: ids }));
      setReschedulePreview(false);
    } catch {
      setError("Couldn't read saved progress from this browser.");
    }
  }, [storageKey]);

  useEffect(() => {
    if (initialQuery) void calculate(undefined, initialQuery);
  }, []);

  useEffect(() => {
    if (!active) {
      document.title = "PlaylistLength — Make time for what you want to learn";
      return;
    }
    document.title = `${active.title} — ${formatDuration(totalDuration, true)} | PlaylistLength`;
    const meta = document.querySelector('meta[property="og:title"]');
    meta?.setAttribute("content", `${formatDuration(totalDuration, true)} of watch time, a personalised study schedule, and calendar export for ${active.title}.`);
  }, [active, totalDuration]);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3200);
  }

  async function calculate(event?: FormEvent, value = query) {
    event?.preventDefault();
    const links = value.split(/\n/).map((line) => line.trim()).filter(Boolean).slice(0, 5);
    if (!links.length) {
      setError("Paste a YouTube playlist, video, or channel link to get started.");
      return;
    }
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const loaded = await Promise.all(links.map(loadPlaylist));
      setResults(loaded);
      setSpeed(1);
      setFilter("");
      if (loaded.length > 1) setQuery(links.join("\n"));
      if (loaded.length === 1) {
        const route = resolveInput(links[0]);
        window.history.replaceState({}, "", `/${route.mode}/${encodeURIComponent(route.value)}`);
      } else {
        window.history.replaceState({}, "", "/");
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function setVideoWatched(video: Video, checked: boolean) {
    if (!active || video.unavailable) return;
    const updated = checked ? [...new Set([...watchedIds, video.id])] : watchedIds.filter((id) => id !== video.id);
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated));
    } catch {
      setError("Couldn't save your progress in this browser. Check your storage settings and try again.");
      return;
    }
    setWatched((previous) => ({ ...previous, [active.id]: updated }));
  }

  function confirmReschedule() {
    if (!active) return;
    setScheduledWatched((previous) => ({ ...previous, [active.id]: currentProgress }));
    setReschedulePreview(false);
    notify("Your study plan has been rescheduled around your progress.");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      notify("Link copied to clipboard.");
    } catch {
      notify("Clipboard access isn't available in this browser.");
    }
  }

  function selectExample(id: string) {
    setQuery(id);
    void calculate(undefined, id);
  }

  const faqs = [
    ["Is there a playlist size limit?", "PlaylistLength paginates through YouTube's playlist API and supports up to 5,000 videos per playlist. Very large playlists can take a little longer to process."],
    ["Why might my total differ from YouTube?", "YouTube can omit private, deleted, or region-restricted videos, and API data can take time to update. Unavailable videos are shown separately and excluded from the total."],
    ["Can I use this on my phone?", "Yes. The calculator, planner, progress checklist, and calendar export are designed to work on mobile screens."],
    ["Where is my progress stored?", "Watched status stays in local storage on this device. We don't create an account or send your progress to a server."],
  ];

  return (
    <main className={dark ? "app dark" : "app light"}>
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <header className="navbar">
        <a className="brand" href="#" aria-label="PlaylistLength home"><span className="brand-mark"><Play size={17} fill="currentColor" /></span><span>playlist<span className="brand-accent">length</span></span></a>
        <nav className="nav-links" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a><a href="#features">Features</a><a href="#faq">FAQ</a>
        </nav>
        <div className="nav-actions">
          <button className="icon-button" onClick={copyLink} aria-label="Copy page link" title="Copy page link"><ArrowUpRight size={17} /></button>
          <button className="icon-button" onClick={() => setDark(!dark)} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title="Toggle theme">{dark ? <Sun size={17} /> : <Moon size={17} />}</button>
          <a className="github-link" href="https://github.com" target="_blank" rel="noreferrer"><Github size={16} /><span>GitHub</span></a>
        </div>
      </header>

      <section className="hero">
        <motion.div className="hero-content" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT LEARNING STREAK STARTS HERE</div>
          <h1>How long is that YouTube playlist?<br /><span>Build a plan. Watch it.</span></h1>
          <p className="hero-subtitle">Paste a playlist, video or channel link. Get total watch time, a smart daily schedule, and export it to Google Calendar.</p>
          <form className="search-form" onSubmit={(event) => void calculate(event)}>
            <Youtube className="youtube-icon" size={22} aria-hidden="true" />
            <textarea aria-label="YouTube playlist, video, or channel links" placeholder={"https://youtube.com/playlist?list=…"} value={query} onChange={(event) => { setQuery(event.target.value); event.currentTarget.style.height = "24px"; event.currentTarget.style.height = `${Math.min(event.currentTarget.scrollHeight, 70)}px`; }} rows={1} />
            <button className="calculate-button" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={17} /> : <><span>Calculate</span><ArrowRight size={17} /></>}</button>
          </form>
          <p className="input-hint"><span>↵</span> Paste up to 5 links, one per line <span className="hint-separator">·</span> <button onClick={() => void navigator.clipboard.readText().then((value) => setQuery((previous) => `${previous}${previous ? "\n" : ""}${value}`)).catch(() => notify("Clipboard access isn't available in this browser."))}>Paste from clipboard</button></p>
          {error && <motion.div className="error-message" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}><span>!</span>{error}<button onClick={() => void calculate()} aria-label="Retry loading playlist">Retry</button></motion.div>}
          <div className="example-row"><span className="example-label">TRY AN EXAMPLE</span>{examples.map((example) => <button className="example-chip" key={example.id} onClick={() => selectExample(example.id)}><Play size={11} fill="currentColor" />{example.label}</button>)}</div>
          <div className="trust-row"><span><Check size={13} /> Up to 5,000 videos</span><i /><span>No sign-up</span><i /><span>Progress stays in your browser</span><i /><span>Calendar export</span></div>
        </motion.div>
        <div className="hero-decoration" aria-hidden="true"><div className="orbit orbit-a" /><div className="orbit orbit-b" /><div className="orbit-core"><Play size={35} fill="currentColor" /></div><div className="orbit-chip chip-a"><Clock3 size={14} /> 15h 42m</div><div className="orbit-chip chip-b"><Sparkles size={14} /> YOUR PACE</div><div className="orbit-chip chip-c"><CalendarDays size={14} /> 12-day plan</div></div>
      </section>

      {loading && <section className="results-wrap"><div className="skeleton-card"><div className="skeleton-cover shimmer" /><div className="skeleton-lines"><i className="shimmer" /><i className="shimmer" /><i className="shimmer" /></div><div className="skeleton-total shimmer" /></div><div className="loading-copy"><span className="loading-pulse" /> Fetching playlist details and video durations…</div></section>}

      <AnimatePresence>
        {results.length > 0 && !loading && <motion.section className="results-wrap" id="results" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.45 }}>
          {results.length > 1 && <div className="compare-grid">{results.map((playlist) => <Glass key={playlist.id} className="compare-card"><img src={playlist.thumbnail} alt="" /><div><span className="mini-label">PLAYLIST</span><h3>{playlist.title}</h3><p>{playlist.videos.filter((video) => !video.unavailable).length} videos · {formatDuration(playlist.videos.reduce((sum, video) => sum + (video.unavailable ? 0 : video.duration), 0), true)}</p></div></Glass>)}</div>}
          {active && <>
            <div className="section-kicker"><span className="kicker-icon"><Zap size={14} /></span> YOUR PLAYLIST, DECODED <button className="copy-button" onClick={() => void navigator.clipboard.writeText(active.title).then(() => notify("Playlist title copied.")).catch(() => notify("Clipboard access isn't available."))}>Copy title</button></div>
            <Glass className="playlist-card">
              <div className="playlist-identity"><div className="playlist-image-wrap"><img src={active.thumbnail || "https://placehold.co/180x110/20233b/aaa?text=Playlist"} alt="" /><span className="play-overlay"><Play fill="currentColor" size={18} /></span></div><div className="playlist-meta"><span className="mini-label">YOUTUBE PLAYLIST</span><h2>{active.title}</h2><p>{active.channel} <span className="meta-dot" /> {active.videos.filter((video) => !video.unavailable).length} videos <span className="meta-dot" /> {active.videos.filter((video) => video.unavailable).length} unavailable</p></div></div>
              <div className="total-block"><span className="mini-label">TOTAL WATCH TIME</span><strong><AnimatedDuration seconds={totalDuration} /></strong><span className="total-sub">{formatDuration(totalDuration)} at 1× speed</span></div>
            </Glass>
            <div className="stat-grid">
              {[
                { label: "AVERAGE VIDEO", value: formatDuration(watchable.length ? totalDuration / watchable.length : 0), icon: <Timer size={17} /> },
                { label: "LONGEST VIDEO", value: formatDuration(Math.max(0, ...watchable.map((video) => video.duration))), icon: <ArrowUpRight size={17} /> },
                { label: "SHORTEST VIDEO", value: watchable.length ? formatDuration(Math.min(...watchable.map((video) => video.duration))) : "—", icon: <ArrowDown size={17} /> },
                { label: "UNAVAILABLE", value: `${active.videos.filter((video) => video.unavailable).length} videos`, icon: <span className="stat-dash">—</span> },
              ].map((stat) => <Glass className="stat-card" key={stat.label}><span className="stat-icon">{stat.icon}</span><span className="mini-label">{stat.label}</span><strong>{stat.value}</strong></Glass>)}
            </div>
            <Glass className="speed-card"><div className="speed-heading"><div><div className="section-kicker"><span className="kicker-icon"><Gauge size={14} /></span> FIND YOUR PACE</div><h3>Same lessons. Less time.</h3></div><div className="speed-total"><span className="mini-label">AT {currentSpeed.toFixed(currentSpeed % 1 ? 2 : 0)}× SPEED</span><strong>{formatDuration(totalDuration / currentSpeed, true)}</strong></div></div><div className="speed-controls"><div className="speed-segments">{speeds.map((option) => <button key={option} className={speed === option ? "active" : ""} onClick={() => setSpeed(option)}>{option}×</button>)}<button className={speed === -1 ? "active" : ""} onClick={() => setSpeed(-1)}>Custom</button></div><label className="range-label">Custom speed <span>{customSpeed.toFixed(2)}×</span><input aria-label="Custom playback speed" type="range" min="0.5" max="3" step="0.05" value={customSpeed} onChange={(event) => { setCustomSpeed(Number(event.target.value)); setSpeed(-1); }} /></label></div></Glass>

            <div className="section-heading"><div><div className="section-kicker"><span className="kicker-icon"><GraduationCap size={14} /></span> THE SMART STUDY PLANNER</div><h2>Make a little progress, every day.</h2><p>A plan that fits your schedule—not the other way around.</p></div><span className="planner-badge"><Sparkles size={13} /> PERSONALISED FOR YOU</span></div>
            <Glass className="planner-card">
              <div className="planner-controls">
                <label className="planner-control"><span>Hours per day <b>{hoursPerDay.toFixed(2).replace(/0$/, "")}h</b></span><input aria-label="Hours per day" type="range" min="0.25" max="4" step="0.25" value={hoursPerDay} onChange={(event) => setHoursPerDay(Number(event.target.value))} /></label>
                <label className="planner-control"><span>Session limit <b>{minutesPerSession} min</b></span><input aria-label="Minutes per session" type="range" min="5" max="120" step="5" value={minutesPerSession} onChange={(event) => setMinutesPerSession(Number(event.target.value))} /></label>
                <label className="planner-control date-control"><span>Start date</span><input aria-label="Start date" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} /></label>
                <label className="planner-control"><span>Watch speed</span><select aria-label="Planner watch speed" value={speed} onChange={(event) => setSpeed(Number(event.target.value))}>{speeds.map((option) => <option key={option} value={option}>{option}× speed</option>)}<option value={-1}>Custom · {customSpeed.toFixed(2)}×</option></select></label>
                <label className="planner-control"><span>Playlist portion <b>{completion}%</b></span><input aria-label="Playlist portion" type="range" min="10" max="100" step="5" value={completion} onChange={(event) => setCompletion(Number(event.target.value))} /></label>
                <label className="weekend-toggle"><input type="checkbox" checked={skipWeekends} onChange={(event) => setSkipWeekends(event.target.checked)} /><span className="toggle-track" /><span>Skip weekends</span></label>
              </div>
              <div className="planner-overview"><div><span className="mini-label">YOUR STUDY PLAN</span><h3>{playlistDays.length} focused {playlistDays.length === 1 ? "day" : "days"} <span>·</span> {formatDuration(playlistDays.reduce((sum, day) => sum + day.duration, 0), true)}</h3><p>{playlistDays.length ? `${formatDate(playlistDays[0].date, { month: "short", day: "numeric" })} → ${formatDate(playlistDays[playlistDays.length - 1].date, { month: "short", day: "numeric" })}` : "Adjust your plan to get started."}</p></div><div className="calendar-actions"><label className="time-picker">Start <input aria-label="Calendar event start time" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} /></label><label className="reminder-picker">ICS reminder <select aria-label="iCalendar file reminder" value={reminder} onChange={(event) => setReminder(Number(event.target.value))}>{[5, 10, 15, 30, 60].map((minutes) => <option key={minutes} value={minutes}>{minutes} min before</option>)}</select></label>{playlistDays[0] && <a className="export-button" href={googleCalendarEventUrl(active, playlistDays[0], startTime)} target="_blank" rel="noreferrer"><CalendarDays size={16} /> Add first session to Google Calendar</a>}<button className="export-button" onClick={() => { importAllSessions(active, playlistDays, startTime, reminder); notify(`Downloaded all ${playlistDays.length} sessions. Import the .ics file in the Google Calendar tab.`); }} disabled={!playlistDays.length}><CalendarDays size={16} /> Add all sessions to Google Calendar</button></div></div>
              {progressChanged && <div className="reschedule-panel"><span><Sparkles size={14} /> {reschedulePreview && playlistDays.length && previewDays.length ? `Your schedule shifts from ${formatDate(playlistDays[playlistDays.length - 1].date, { month: "short", day: "numeric" })} to ${formatDate(previewDays[previewDays.length - 1].date, { month: "short", day: "numeric" })}.` : "You’ve checked off videos. Ready to update your study plan?"}</span>{reschedulePreview ? <button onClick={confirmReschedule}>Confirm reschedule <Check size={13} /></button> : <button onClick={() => setReschedulePreview(true)}>Reschedule <ArrowRight size={13} /></button>}</div>}
              <div className="schedule-table"><div className="schedule-table-head"><span>DAY</span><span>YOUR STUDY SESSION</span><span>WATCH TIME</span><span>ADD</span></div>{playlistDays.slice(0, 12).map((day, index) => <div className="schedule-row" key={day.date.toISOString()}><div className="day-number"><span>{String(index + 1).padStart(2, "0")}</span><b>{formatDate(day.date)}</b></div><div className="day-session"><span className="video-count">{day.videos.length} {day.videos.length === 1 ? "video" : "videos"}</span><div className="timeline">{day.videos.slice(0, 10).map((video, i) => <span key={`${video.id}-${i}`} className={video.duration < 600 ? "length-short" : video.duration < 1800 ? "length-medium" : "length-long"} style={{ width: `${Math.max(7, Math.min(44, video.duration / day.duration * 100))}%` }} title={`${video.title} · ${formatDuration(video.duration)}`} />)}</div><span className="day-video-title">{day.videos[0]?.title}{day.videos.length > 1 ? ` + ${day.videos.length - 1} more` : ""}</span>{day.marathon && <span className="marathon-badge">LONG VIDEO</span>}</div><strong className="day-duration">{formatDuration(day.duration)}</strong><a className="schedule-calendar-link" href={googleCalendarEventUrl(active, day, startTime)} target="_blank" rel="noreferrer" aria-label={`Add study session day ${index + 1} to Google Calendar`} title={`Add day ${index + 1} to Google Calendar`}><CalendarDays size={14} /><span>Add</span></a></div>)}</div>
              {playlistDays.length > 12 && <p className="showing-note">Showing 12 of {playlistDays.length} study days. All days are included in your calendar export.</p>}
              <p className="planner-footnote"><Sparkles size={13} /> Add all sessions opens Google Calendar's import page and downloads the full plan. Choose the downloaded .ics file to import; each session keeps the course name and lists its videos.</p>
            </Glass>

            <section className="video-section"><div className="video-section-heading"><div><div className="section-kicker"><span className="kicker-icon"><ListChecks size={14} /></span> YOUR WATCH LIST</div><h2>One video at a time.</h2><p><strong>{formatDuration(remaining)}</strong> left to watch <span>·</span> {watchedIds.length} of {watchable.length} completed</p></div><div className="watch-actions">{progressChanged && <button className="text-button" onClick={() => setReschedulePreview(true)}>Reschedule <ArrowRight size={14} /></button>}<button className="text-button" onClick={() => { const ids = watchable.map((video) => video.id); try { localStorage.setItem(storageKey, JSON.stringify(ids)); setWatched((previous) => ({ ...previous, [active.id]: ids })); } catch { setError("Couldn't save your progress in this browser. Check your storage settings and try again."); } }}>Mark all watched <Check size={14} /></button></div></div><Glass className="video-list-card"><div className="video-list-toolbar"><div className="video-search"><Search size={16} /><input aria-label="Search videos" placeholder="Find a video…" value={filter} onChange={(event) => setFilter(event.target.value)} /></div><span>{visibleVideos.length} videos</span></div><div className="video-list">{visibleVideos.map((video) => <label key={video.id} className={`video-row ${video.unavailable ? "unavailable" : ""} ${watchedIds.includes(video.id) ? "watched" : ""}`}><input type="checkbox" disabled={video.unavailable} checked={watchedIds.includes(video.id)} onChange={(event) => setVideoWatched(video, event.target.checked)} /><span className="video-index">{String(active.videos.indexOf(video) + 1).padStart(2, "0")}</span><div className="video-thumb">{video.thumbnail ? <img src={video.thumbnail} alt="" loading="lazy" /> : <Play size={14} />}</div><span className="video-title">{video.title}{video.unavailable && <small>Unavailable · excluded from total</small>}</span><span className="video-duration">{video.unavailable ? "—" : formatDuration(video.duration)}</span></label>)}</div><div className="video-list-footer">Your watch progress is saved privately on this device <BookmarkCheck size={14} /></div></Glass></section>
          </>}
        </motion.section>}
      </AnimatePresence>

      <section className="how-section" id="how-it-works"><div className="section-heading centered"><div className="section-kicker"><span className="kicker-icon"><Sparkles size={14} /></span> SIMPLE BY DESIGN</div><h2>From “someday” to <span>done.</span></h2><p>Three little steps between you and your next big skill.</p></div><div className="steps-grid">{[{ icon: <Youtube size={21} />, number: "01", title: "Paste your playlist", text: "Drop in a YouTube link, video, or channel. No sign-up, no friction." }, { icon: <Clock3 size={21} />, number: "02", title: "See the real total", text: "Get accurate watch time, speed breakdowns, and a plan built around you." }, { icon: <CalendarDays size={21} />, number: "03", title: "Finish what you start", text: "Add study sessions to your calendar. Check off videos as you go." }].map((step) => <Glass className="step-card" key={step.number}><div className="step-top"><span className="step-icon">{step.icon}</span><span>{step.number}</span></div><h3>{step.title}</h3><p>{step.text}</p></Glass>)}</div></section>

      <section className="features-section" id="features"><div className="section-heading centered"><div className="section-kicker"><span className="kicker-icon"><Zap size={14} /></span> BUILT FOR YOUR NEXT DEEP DIVE</div><h2>Less guessing. <span>More learning.</span></h2><p>Everything you need to turn a saved playlist into real progress.</p></div><div className="feature-grid">{[{ icon: <Timer size={19} />, title: "The whole picture", body: "Get the real total across up to 5,000 videos—not a guess based on the first few." }, { icon: <BookmarkCheck size={19} />, title: "Progress that sticks", body: "Your watched videos are saved privately in your browser. Pick up right where you left off." }, { icon: <Code2 size={19} />, title: "Compare your options", body: "Compare up to five courses side by side before you decide what to learn next." }, { icon: <ShieldIcon />, title: "Honest by design", body: "Private, deleted, and region-blocked videos are clearly marked and excluded from totals." }].map((feature) => <Glass className="feature-card" key={feature.title}><span className="feature-icon">{feature.icon}</span><h3>{feature.title}</h3><p>{feature.body}</p></Glass>)}</div></section>

      <section className="savings-section"><div className="section-heading centered"><div className="section-kicker"><span className="kicker-icon"><Gauge size={14} /></span> A LITTLE FASTER, A LOT SOONER</div><h2>Time saved, <span>at your pace.</span></h2><p>Choose a playback speed that works for you and see the hours add up.</p></div><Glass className="savings-card"><div className="savings-table"><div className="savings-row savings-head"><span>COURSE LENGTH</span>{[1.25, 1.5, 1.75, 2].map((speedValue) => <span key={speedValue}>{speedValue}× SPEED</span>)}</div>{[5, 10, 20, 40].map((hours) => <div className="savings-row" key={hours}><strong>{hours} hours</strong>{[1.25, 1.5, 1.75, 2].map((speedValue) => <span key={speedValue}>{formatDuration(hours * 3600 / speedValue, true)} <small>save {formatDuration(hours * 3600 * (1 - 1 / speedValue), true)}</small></span>)}</div>)}</div><p>* Playback speed changes time spent watching—not the content itself. Your mileage may vary.</p></Glass></section>

      <section className="faq-section" id="faq"><div className="section-heading centered"><div className="section-kicker"><span className="kicker-icon"><Plus size={14} /></span> GOOD QUESTIONS</div><h2>A few things you <span>might wonder.</span></h2></div><div className="faq-list">{faqs.map(([question, answer], index) => <Glass className={`faq-item ${faq === index ? "open" : ""}`} key={question}><button onClick={() => setFaq(faq === index ? null : index)} aria-expanded={faq === index}><span>{question}</span><ChevronDown size={17} /></button><AnimatePresence>{faq === index && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>{answer}</motion.p>}</AnimatePresence></Glass>)}</div></section>

      <footer className="footer"><a className="brand" href="#"><span className="brand-mark"><Play size={15} fill="currentColor" /></span><span>playlist<span className="brand-accent">length</span></span></a><p>Made for the things you’ve been meaning to learn.</p><span className="privacy-note"><Check size={13} /> No accounts. Your progress stays yours.</span><span className="footer-copy">© 2025 PlaylistLength</span></footer>
      <AnimatePresence>{toast && <motion.div className="toast" role="status" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}><Check size={16} />{toast}</motion.div>}</AnimatePresence>
    </main>
  );
}

function ShieldIcon() {
  return <span className="shield-mark"><Check size={13} /></span>;
}

export default App;
