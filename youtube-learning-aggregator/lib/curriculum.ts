import type { ModuleKind } from "./types";

export interface ModuleTemplate {
  id: string;
  kind: ModuleKind;
  title: string;
  description: string;
  query: string;
  searchPlaylists?: boolean;
}

const EXAM_KEYWORDS = [
  "exam",
  "certification",
  "certified",
  "comptia",
  "ccna",
  "ccnp",
  "ccie",
  "cissp",
  "pmp",
  "itil",
  "aws certified",
  "azure",
  "cfa",
  "series 7",
  "bar exam",
  "mcat",
  "praxis",
  "network+",
  "security+",
  "a+",
  "linux+",
  "cysa+",
  "pentest+",
  "gre",
  "gmat",
  "sat",
  "toefl",
  "ielts",
  "certificate",
];

export function isExamLikeTopic(topic: string): boolean {
  const normalized = topic.toLowerCase();
  return EXAM_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

export function buildModulePlan(topic: string): ModuleTemplate[] {
  const examLike = isExamLikeTopic(topic);

  const modules: ModuleTemplate[] = [
    {
      id: "full-course",
      kind: "full-course",
      title: "Full Courses & Complete Playlists",
      description: `Long-form courses and full playlists that cover ${topic} end to end.`,
      query: `${topic} full course`,
      searchPlaylists: true,
    },
    {
      id: "fundamentals",
      kind: "fundamentals",
      title: "Fundamentals & Core Concepts",
      description: `Beginner-friendly explainers to build a solid foundation in ${topic}.`,
      query: `${topic} fundamentals explained for beginners`,
    },
    {
      id: "tutorials",
      kind: "deep-dive",
      title: `${topic} Tutorials & Walkthroughs`,
      description: `Hands-on tutorials and worked examples covering key parts of ${topic}.`,
      query: `${topic} tutorial`,
    },
    {
      id: "advanced",
      kind: "deep-dive",
      title: `Advanced ${topic} Concepts`,
      description: `Deeper dives for once you have the basics down.`,
      query: `${topic} advanced concepts explained`,
    },
  ];

  if (examLike) {
    modules.push(
      {
        id: "exam-objectives",
        kind: "deep-dive",
        title: "Exam Objectives Overview",
        description: `Videos walking through the official exam objectives/domains for ${topic}.`,
        query: `${topic} exam objectives overview`,
      },
      {
        id: "practice-questions",
        kind: "practice-exam",
        title: "Practice Questions & Mock Exams",
        description: `Practice questions and full mock exams to test your readiness for ${topic}.`,
        query: `${topic} practice exam questions`,
      },
      {
        id: "exam-tips",
        kind: "practice-exam",
        title: "Exam Tips & Study Strategy",
        description: `Advice on how to study for and pass ${topic} from people who've done it.`,
        query: `${topic} exam tips how to pass`,
      }
    );
  } else {
    modules.push({
      id: "tips",
      kind: "deep-dive",
      title: "Tips, Best Practices & Common Mistakes",
      description: `Practical advice and pitfalls to avoid when learning ${topic}.`,
      query: `${topic} tips best practices common mistakes`,
    });
  }

  return modules;
}
