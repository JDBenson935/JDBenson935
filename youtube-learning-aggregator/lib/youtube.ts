import { parseIsoDuration } from "./duration";

const API_BASE = "https://www.googleapis.com/youtube/v3";

export class YouTubeApiError extends Error {
  status: number;
  quotaExceeded: boolean;

  constructor(message: string, status: number, quotaExceeded = false) {
    super(message);
    this.name = "YouTubeApiError";
    this.status = status;
    this.quotaExceeded = quotaExceeded;
  }
}

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function callApi<T>(
  path: string,
  params: Record<string, string>,
  apiKey: string
): Promise<T> {
  const url = new URL(`${API_BASE}/${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  url.searchParams.set("key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const reason = body?.error?.errors?.[0]?.reason ?? "";
    const quotaExceeded = reason === "quotaExceeded" || reason === "dailyLimitExceeded";
    const message = body?.error?.message ?? `YouTube API request failed (${res.status})`;
    throw new YouTubeApiError(message, res.status, quotaExceeded);
  }
  return res.json() as Promise<T>;
}

interface SearchListResponse {
  items: Array<{
    id: { videoId?: string; playlistId?: string };
  }>;
}

export interface SearchOptions {
  maxResults?: number;
  order?: "relevance" | "viewCount" | "rating" | "date";
  videoDuration?: "any" | "short" | "medium" | "long";
}

export async function searchVideoIds(
  query: string,
  apiKey: string,
  options: SearchOptions = {}
): Promise<string[]> {
  const data = await callApi<SearchListResponse>(
    "search",
    {
      part: "id",
      q: query,
      type: "video",
      maxResults: String(options.maxResults ?? 15),
      order: options.order ?? "relevance",
      videoDuration: options.videoDuration ?? "any",
      safeSearch: "moderate",
      relevanceLanguage: "en",
    },
    apiKey
  );
  return data.items.map((item) => item.id.videoId).filter((id): id is string => !!id);
}

export async function searchPlaylistIds(
  query: string,
  apiKey: string,
  maxResults = 6
): Promise<string[]> {
  const data = await callApi<SearchListResponse>(
    "search",
    {
      part: "id",
      q: query,
      type: "playlist",
      maxResults: String(maxResults),
      relevanceLanguage: "en",
      safeSearch: "moderate",
    },
    apiKey
  );
  return data.items.map((item) => item.id.playlistId).filter((id): id is string => !!id);
}

interface VideoListItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelId: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
  contentDetails: { duration: string };
  statistics: { viewCount?: string; likeCount?: string };
}

export interface VideoDetails {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  thumbnailUrl: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
}

export async function getVideoDetails(
  ids: string[],
  apiKey: string
): Promise<VideoDetails[]> {
  if (ids.length === 0) return [];
  const results: VideoDetails[] = [];
  for (const group of chunk(ids, 50)) {
    const data = await callApi<{ items: VideoListItem[] }>(
      "videos",
      { part: "snippet,contentDetails,statistics", id: group.join(",") },
      apiKey
    );
    for (const item of data.items) {
      results.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelId: item.snippet.channelId,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          "",
        durationSeconds: parseIsoDuration(item.contentDetails.duration),
        viewCount: Number(item.statistics.viewCount ?? 0),
        likeCount: Number(item.statistics.likeCount ?? 0),
      });
    }
  }
  return results;
}

interface ChannelListItem {
  id: string;
  statistics: { subscriberCount?: string };
}

export async function getChannelSubscriberCounts(
  ids: string[],
  apiKey: string
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length === 0) return counts;
  for (const group of chunk(uniqueIds, 50)) {
    const data = await callApi<{ items: ChannelListItem[] }>(
      "channels",
      { part: "statistics", id: group.join(",") },
      apiKey
    );
    for (const item of data.items) {
      counts.set(item.id, Number(item.statistics.subscriberCount ?? 0));
    }
  }
  return counts;
}

interface PlaylistListItem {
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
  contentDetails: { itemCount?: number };
}

export interface PlaylistDetails {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  itemCount: number;
}

export async function getPlaylistDetails(
  ids: string[],
  apiKey: string
): Promise<PlaylistDetails[]> {
  if (ids.length === 0) return [];
  const results: PlaylistDetails[] = [];
  for (const group of chunk(ids, 50)) {
    const data = await callApi<{ items: PlaylistListItem[] }>(
      "playlists",
      { part: "snippet,contentDetails", id: group.join(",") },
      apiKey
    );
    for (const item of data.items) {
      results.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl:
          item.snippet.thumbnails.medium?.url ??
          item.snippet.thumbnails.default?.url ??
          "",
        itemCount: item.contentDetails.itemCount ?? 0,
      });
    }
  }
  return results;
}
