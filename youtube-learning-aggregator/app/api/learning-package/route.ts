import { NextRequest, NextResponse } from "next/server";
import { buildModulePlan } from "@/lib/curriculum";
import { rankPlaylists, rankVideos, type ScorableVideo } from "@/lib/rank";
import type { LearningModule, LearningPackage, RankedVideo } from "@/lib/types";
import {
  YouTubeApiError,
  getChannelSubscriberCounts,
  getPlaylistDetails,
  getVideoDetails,
  searchPlaylistIds,
  searchVideoIds,
  type VideoDetails,
} from "@/lib/youtube";

export const runtime = "nodejs";

const VIDEOS_PER_MODULE: Record<string, number> = {
  "full-course": 5,
  default: 6,
};
const PLAYLISTS_PER_MODULE = 4;

function toRankedVideo(video: ScorableVideo & { score: number }): RankedVideo {
  return {
    id: video.id,
    title: video.title,
    description: video.description,
    channelId: video.channelId,
    channelTitle: video.channelTitle,
    channelSubscriberCount: video.channelSubscriberCount,
    publishedAt: video.publishedAt,
    thumbnailUrl: video.thumbnailUrl,
    durationSeconds: video.durationSeconds,
    viewCount: video.viewCount,
    likeCount: video.likeCount,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    score: video.score,
  };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "Server is missing YOUTUBE_API_KEY. Add it to your environment and restart the server.",
      },
      { status: 500 }
    );
  }

  let topic: unknown;
  try {
    const body = await request.json();
    topic = body?.topic;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  if (typeof topic !== "string" || topic.trim().length === 0) {
    return NextResponse.json(
      { error: "Please provide a non-empty 'topic' string." },
      { status: 400 }
    );
  }
  const cleanTopic = topic.trim().slice(0, 120);

  const templates = buildModulePlan(cleanTopic);

  try {
    const searchResults = await Promise.all(
      templates.map(async (template) => {
        const [videoIds, playlistIds] = await Promise.all([
          searchVideoIds(template.query, apiKey, { maxResults: 15 }),
          template.searchPlaylists
            ? searchPlaylistIds(template.query, apiKey, 6)
            : Promise.resolve<string[]>([]),
        ]);
        return { template, videoIds, playlistIds };
      })
    );

    const allVideoIds = Array.from(
      new Set(searchResults.flatMap((r) => r.videoIds))
    );
    const allPlaylistIds = Array.from(
      new Set(searchResults.flatMap((r) => r.playlistIds))
    );

    const [videoDetailsList, playlistDetailsList] = await Promise.all([
      getVideoDetails(allVideoIds, apiKey),
      getPlaylistDetails(allPlaylistIds, apiKey),
    ]);

    const channelIds = videoDetailsList.map((v) => v.channelId);
    const subscriberCounts = await getChannelSubscriberCounts(channelIds, apiKey);

    const videoDetailsById = new Map(videoDetailsList.map((v) => [v.id, v]));
    const playlistDetailsById = new Map(
      playlistDetailsList.map((p) => [p.id, p])
    );

    const usedVideoIds = new Set<string>();
    const modules: LearningModule[] = searchResults.map(
      ({ template, videoIds, playlistIds }) => {
        const scorables: ScorableVideo[] = videoIds
          .map((id) => videoDetailsById.get(id))
          .filter((v): v is VideoDetails => !!v)
          .map((v) => ({
            ...v,
            channelSubscriberCount: subscriberCounts.get(v.channelId) ?? 0,
          }));

        const ranked = rankVideos(scorables, template.kind);
        const limit = VIDEOS_PER_MODULE[template.id] ?? VIDEOS_PER_MODULE.default;

        const selected: RankedVideo[] = [];
        for (const video of ranked) {
          if (usedVideoIds.has(video.id)) continue;
          selected.push(toRankedVideo(video));
          usedVideoIds.add(video.id);
          if (selected.length >= limit) break;
        }

        const playlists = rankPlaylists(
          playlistIds
            .map((id) => playlistDetailsById.get(id))
            .filter((p): p is NonNullable<typeof p> => !!p)
        ).slice(0, PLAYLISTS_PER_MODULE);

        return {
          id: template.id,
          kind: template.kind,
          title: template.title,
          description: template.description,
          query: template.query,
          videos: selected,
          playlists,
        };
      }
    );

    const learningPackage: LearningPackage = {
      topic: cleanTopic,
      generatedAt: new Date().toISOString(),
      modules: modules.filter((m) => m.videos.length > 0 || m.playlists.length > 0),
    };

    return NextResponse.json(learningPackage);
  } catch (error) {
    if (error instanceof YouTubeApiError) {
      const status = error.quotaExceeded ? 429 : error.status >= 400 ? 502 : 500;
      return NextResponse.json(
        {
          error: error.quotaExceeded
            ? "YouTube API quota exceeded for today. Try again later."
            : `YouTube API error: ${error.message}`,
        },
        { status }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Unexpected error building the learning package." },
      { status: 500 }
    );
  }
}
