import type { RankedPlaylist } from "@/lib/types";

export default function PlaylistCard({ playlist }: { playlist: RankedPlaylist }) {
  return (
    <a
      href={playlist.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 transition hover:border-amber-400 hover:shadow-md dark:border-amber-900 dark:bg-amber-950/40"
    >
      {playlist.thumbnailUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={playlist.thumbnailUrl}
          alt=""
          className="h-20 w-32 shrink-0 rounded object-cover"
        />
      ) : (
        <div className="h-20 w-32 shrink-0 rounded bg-amber-200 dark:bg-amber-900" />
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm font-medium text-slate-900 group-hover:text-amber-700 dark:text-slate-100">
          {playlist.title}
        </p>
        <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
          {playlist.channelTitle}
        </p>
        <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
          Playlist · {playlist.itemCount} videos
        </p>
      </div>
    </a>
  );
}
