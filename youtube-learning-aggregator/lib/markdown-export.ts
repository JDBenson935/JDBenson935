import type { LearningPackage } from "./types";
import { formatCount, formatDuration } from "./format";

export function buildMarkdownStudyGuide(pkg: LearningPackage): string {
  const lines: string[] = [];
  lines.push(`# Learning Package: ${pkg.topic}`);
  lines.push("");
  lines.push(`_Generated ${new Date(pkg.generatedAt).toLocaleString()}_`);
  lines.push("");
  lines.push("## Contents");
  pkg.modules.forEach((learningModule, i) => {
    lines.push(`${i + 1}. [${learningModule.title}](#${slugify(learningModule.title)})`);
  });
  lines.push("");

  for (const learningModule of pkg.modules) {
    lines.push(`## ${learningModule.title}`);
    lines.push("");
    lines.push(learningModule.description);
    lines.push("");

    if (learningModule.playlists.length > 0) {
      lines.push("### Playlists");
      lines.push("");
      for (const playlist of learningModule.playlists) {
        lines.push(
          `- **[${playlist.title}](${playlist.url})** — ${playlist.channelTitle} (${playlist.itemCount} videos)`
        );
      }
      lines.push("");
    }

    if (learningModule.videos.length > 0) {
      lines.push("### Videos");
      lines.push("");
      for (const video of learningModule.videos) {
        lines.push(
          `- **[${video.title}](${video.url})** — ${video.channelTitle} · ${formatDuration(
            video.durationSeconds
          )} · ${formatCount(video.viewCount)} views`
        );
      }
      lines.push("");
    }
  }

  return lines.join("\n");
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
