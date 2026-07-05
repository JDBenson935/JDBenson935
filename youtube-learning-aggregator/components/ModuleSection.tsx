import type { LearningModule } from "@/lib/types";
import VideoCard from "./VideoCard";
import PlaylistCard from "./PlaylistCard";

export default function ModuleSection({ module }: { module: LearningModule }) {
  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {module.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {module.description}
        </p>
      </div>

      {module.playlists.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {module.playlists.map((playlist) => (
            <PlaylistCard key={playlist.id} playlist={playlist} />
          ))}
        </div>
      )}

      {module.videos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {module.videos.map((video, i) => (
            <VideoCard key={video.id} video={video} rank={i + 1} />
          ))}
        </div>
      )}
    </section>
  );
}
