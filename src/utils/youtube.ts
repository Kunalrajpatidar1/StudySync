import { Playlist, Video, Mode } from "../types";
import { parseDuration } from "./time";
import { samplePlaylists } from "../sampleData";

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY as string | undefined;

export function resolveInput(input: string): { mode: Mode; value: string } {
  const raw = input.trim();
  if (!raw) throw new Error("Paste a YouTube playlist, video, or channel link to get started.");
  try {
    const url = new URL(
      raw.startsWith("@")
        ? `https://youtube.com/${raw}`
        : /^(?:PL|UU|LL|RD|OLAK5uy_|FL|WL)[\w-]+$/.test(raw)
        ? `https://youtube.com/playlist?list=${raw}`
        : raw.includes("://")
        ? raw
        : `https://${raw}`
    );
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host) && !host.endsWith(".youtube.com")) {
      throw new Error();
    }
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

export async function youtubeRequest<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries({ ...params, key: API_KEY || "" }).forEach(([key, value]) => url.searchParams.set(key, value));
  const response = await fetch(url);
  const body = (await response.json()) as { error?: { message?: string; errors?: { reason?: string }[] } } & T;
  if (!response.ok) {
    const reason = body.error?.errors?.[0]?.reason;
    if (reason === "quotaExceeded" || reason === "dailyLimitExceeded") {
      throw new Error("YouTube's daily API quota has been reached. Please try again later.");
    }
    if (response.status === 403) {
      throw new Error("This playlist may be private or unavailable. Check the sharing settings and try again.");
    }
    throw new Error(body.error?.message || "YouTube couldn't load that link. Please try again.");
  }
  return body;
}

export async function loadPlaylist(input: string): Promise<Playlist> {
  const { mode, value } = resolveInput(input);

  // Demo fallback for sample playlists
  if (samplePlaylists[value]) {
    return samplePlaylists[value];
  }

  if (!API_KEY) {
    if (samplePlaylists[value]) return samplePlaylists[value];
    throw new Error("Add your YouTube Data API key to .env as VITE_YOUTUBE_API_KEY, or explore the example courses below.");
  }

  let playlistId = value;
  let title = "";
  let channel = "";
  let thumbnail = "";

  if (mode === "channel") {
    const query: Record<string, string> = value.startsWith("UC") ? { id: value } : { forHandle: value };
    const data = await youtubeRequest<{
      items?: {
        id: string;
        snippet: { title: string; thumbnails?: { medium?: { url: string } } };
        contentDetails: { relatedPlaylists: { uploads: string } };
      }[];
    }>("channels", { part: "snippet,contentDetails", ...query });
    const item = data.items?.[0];
    if (!item) throw new Error("We couldn't find that channel. Check the handle and try again.");
    playlistId = item.contentDetails.relatedPlaylists.uploads;
    title = `${item.snippet.title} · uploads`;
    channel = item.snippet.title;
    thumbnail = item.snippet.thumbnails?.medium?.url || "";
  }

  let videos: Video[] = [];
  if (mode === "video") {
    const data = await youtubeRequest<{
      items?: {
        id: string;
        snippet: { title: string; channelTitle: string; thumbnails?: { medium?: { url: string } } };
        contentDetails: { duration: string };
      }[];
    }>("videos", { part: "snippet,contentDetails", id: value });
    const item = data.items?.[0];
    if (!item) throw new Error("That video is unavailable or private.");
    title = item.snippet.title;
    channel = item.snippet.channelTitle;
    thumbnail = item.snippet.thumbnails?.medium?.url || "";
    videos = [{ id: item.id, title: item.snippet.title, duration: parseDuration(item.contentDetails.duration), thumbnail }];
    playlistId = `video-${item.id}`;
  } else {
    if (!title) {
      const data = await youtubeRequest<{ items?: { snippet: { title: string; channelTitle: string; thumbnails?: { medium?: { url: string } } } }[] }>(
        "playlists",
        { part: "snippet", id: playlistId }
      );
      const item = data.items?.[0];
      if (!item) throw new Error("We couldn't find that playlist. It may be private, deleted, or invalid.");
      title = item.snippet.title;
      channel = item.snippet.channelTitle;
      thumbnail = item.snippet.thumbnails?.medium?.url || "";
    }
    const ids: string[] = [];
    let pageToken = "";
    do {
      const data = await youtubeRequest<{
        nextPageToken?: string;
        items?: { snippet: { title: string; thumbnails?: { medium?: { url: string } }; resourceId?: { videoId?: string } } }[];
      }>("playlistItems", {
        part: "snippet",
        playlistId,
        maxResults: "50",
        ...(pageToken ? { pageToken } : {}),
      });
      for (const item of (data.items || []).slice(0, 5000 - videos.length)) {
        const id = item.snippet.resourceId?.videoId;
        ids.push(id || "");
        videos.push({
          id: id || `unavailable-${videos.length}`,
          title: item.snippet.title || "Unavailable video",
          duration: 0,
          thumbnail: item.snippet.thumbnails?.medium?.url || "",
          unavailable: !id,
        });
      }
      pageToken = data.nextPageToken || "";
    } while (pageToken && videos.length < 5000);

    for (let index = 0; index < ids.length; index += 50) {
      const batch = ids.slice(index, index + 50).filter(Boolean);
      if (!batch.length) continue;
      const data = await youtubeRequest<{ items?: { id: string; contentDetails: { duration: string } }[] }>("videos", {
        part: "contentDetails",
        id: batch.join(","),
      });
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
