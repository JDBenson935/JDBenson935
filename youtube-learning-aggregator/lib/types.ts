export interface RankedVideo {
  id: string;
  title: string;
  description: string;
  channelId: string;
  channelTitle: string;
  channelSubscriberCount: number;
  publishedAt: string;
  thumbnailUrl: string;
  durationSeconds: number;
  viewCount: number;
  likeCount: number;
  url: string;
  score: number;
}

export interface RankedPlaylist {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnailUrl: string;
  itemCount: number;
  url: string;
  score: number;
}

export type ModuleKind =
  | "full-course"
  | "fundamentals"
  | "deep-dive"
  | "practice-exam";

export interface LearningModule {
  id: string;
  kind: ModuleKind;
  title: string;
  description: string;
  query: string;
  videos: RankedVideo[];
  playlists: RankedPlaylist[];
}

export interface LearningPackage {
  topic: string;
  generatedAt: string;
  modules: LearningModule[];
}
