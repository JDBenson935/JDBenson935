"use client";

import { useState } from "react";
import type { LearningPackage } from "@/lib/types";
import { buildMarkdownStudyGuide } from "@/lib/markdown-export";
import ModuleSection from "@/components/ModuleSection";

const EXAMPLES = [
  "CompTIA Network+",
  "Cybersecurity",
  "Project Management",
  "AWS Solutions Architect",
];

export default function Home() {
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pkg, setPkg] = useState<LearningPackage | null>(null);

  async function buildPackage(chosenTopic: string) {
    const trimmed = chosenTopic.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setPkg(null);
    try {
      const res = await fetch("/api/learning-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error ?? "Something went wrong.");
      }
      setPkg(data as LearningPackage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function handleExport() {
    if (!pkg) return;
    const markdown = buildMarkdownStudyGuide(pkg);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pkg.topic.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-study-guide.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          YouTube Learning Aggregator
        </h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Enter any topic or exam and get a curated, structured learning path
          built from the best videos and playlists on YouTube.
        </p>
      </header>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          buildPackage(topic);
        }}
        className="mx-auto flex max-w-xl gap-2"
      >
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. CompTIA Network+, cybersecurity, project management..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30 dark:border-slate-700 dark:bg-slate-900"
        />
        <button
          type="submit"
          disabled={loading || !topic.trim()}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Building..." : "Build My Learning Package"}
        </button>
      </form>

      <div className="mx-auto mt-3 flex max-w-xl flex-wrap justify-center gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => {
              setTopic(example);
              buildPackage(example);
            }}
            disabled={loading}
            className="rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-600 transition hover:border-brand-500 hover:text-brand-600 disabled:opacity-50 dark:border-slate-700 dark:text-slate-400"
          >
            {example}
          </button>
        ))}
      </div>

      {loading && (
        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          Searching YouTube and ranking the best resources for &ldquo;{topic}
          &rdquo;...
        </p>
      )}

      {error && (
        <div className="mx-auto mt-8 max-w-xl rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {pkg && (
        <div className="mt-10 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h2 className="text-xl font-bold">{pkg.topic}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generated {new Date(pkg.generatedAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={handleExport}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium transition hover:border-brand-500 hover:text-brand-600 dark:border-slate-700"
            >
              Export as Markdown
            </button>
          </div>

          {pkg.modules.map((module) => (
            <ModuleSection key={module.id} module={module} />
          ))}
        </div>
      )}
    </main>
  );
}
