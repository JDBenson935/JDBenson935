import type { ModuleKind, RankedPlaylist } from "./types";
import type { PlaylistDetails, VideoDetails } from "./youtube";

export interface ScorableVideo extends VideoDetails {
  channelSubscriberCount: number;
}

const DURATION_PROFILES: Record<
  ModuleKind,
  { idealMin: number; idealMax: number; hardMin: number }
> = {
  "full-course": { idealMin: 1800, idealMax: 14400, hardMin: 600 },
  fundamentals: { idealMin: 240, idealMax: 1800, hardMin: 60 },
  "deep-dive": { idealMin: 300, idealMax: 2700, hardMin: 60 },
  "practice-exam": { idealMin: 300, idealMax: 10800, hardMin: 60 },
};

function durationFit(durationSeconds: number, kind: ModuleKind): number {
  const profile = DURATION_PROFILES[kind];
  if (durationSeconds < profile.hardMin) return 0.25;
  if (durationSeconds >= profile.idealMin && durationSeconds <= profile.idealMax) {
    return 1;
  }
  if (durationSeconds < profile.idealMin) {
    const ratio = durationSeconds / profile.idealMin;
    return 0.5 + 0.5 * ratio;
  }
  const overshoot = durationSeconds / profile.idealMax;
  return Math.max(0.5, 1 - (overshoot - 1) * 0.2);
}

function recencyFactor(publishedAt: string): number {
  const ageDays = (Date.now() - new Date(publishedAt).getTime()) / 86_400_000;
  if (ageDays < 365) return 1;
  if (ageDays < 365 * 2) return 0.85;
  if (ageDays < 365 * 4) return 0.65;
  if (ageDays < 365 * 7) return 0.45;
  return 0.3;
}

export function scoreVideo(video: ScorableVideo, kind: ModuleKind): number {
  const viewScore = Math.log10(video.viewCount + 10);
  const likeRatio = video.viewCount > 0 ? video.likeCount / video.viewCount : 0;
  const engagementScore = Math.min(likeRatio * 100, 10);
  const channelScore = Math.log10(video.channelSubscriberCount + 10);

  const base = viewScore * 1.0 + engagementScore * 1.5 + channelScore * 0.8;
  const fit = durationFit(video.durationSeconds, kind);
  const recency = recencyFactor(video.publishedAt);

  return base * (0.4 + 0.6 * fit) * (0.7 + 0.3 * recency);
}

export function rankVideos(
  videos: ScorableVideo[],
  kind: ModuleKind
): (ScorableVideo & { score: number })[] {
  return videos
    .map((video) => ({ ...video, score: scoreVideo(video, kind) }))
    .sort((a, b) => b.score - a.score);
}

export function scorePlaylist(playlist: PlaylistDetails): number {
  const sizeScore = Math.log10(playlist.itemCount + 2);
  return sizeScore;
}

export function rankPlaylists(playlists: PlaylistDetails[]): RankedPlaylist[] {
  return playlists
    .map((playlist) => ({
      id: playlist.id,
      title: playlist.title,
      description: playlist.description,
      channelTitle: playlist.channelTitle,
      thumbnailUrl: playlist.thumbnailUrl,
      itemCount: playlist.itemCount,
      url: `https://www.youtube.com/playlist?list=${playlist.id}`,
      score: scorePlaylist(playlist),
    }))
    .sort((a, b) => b.score - a.score);
}
