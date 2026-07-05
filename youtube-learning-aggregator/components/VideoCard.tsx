import type { RankedVideo } from "@/lib/types";
import { formatCount, formatDuration, formatRelativeDate } from "@/lib/format";

export default function VideoCard({
  video,
  rank,
}: {
  video: RankedVideo;
  rank: number;
}) {
  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-lg border border-slate-200 bg-white p-3 transition hover:border-brand-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="relative shrink-0">
        {video.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={video.thumbnailUrl}
            alt=""
            className="h-20 w-32 rounded object-cover"
          />
        ) : (
          <div className="h-20 w-32 rounded bg-slate-200 dark:bg-slate-800" />
        )}
        {rank === 1 && (
          <span className="absolute -left-2 -top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            Top pick
          </span>
        )}
        <span className="absolute bottom-1 right-1 rounded bg-black/75 px-1 text-[10px] font-medium text-white">
          {formatDuration(video.durationSeconds)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-brand-600 dark:text-slate-100">
          {video.title}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
          {video.channelTitle}
        </p>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          {formatCount(video.viewCount)} views · {formatRelativeDate(video.publishedAt)}
        </p>
      </div>
    </a>
  );
}
