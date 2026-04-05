import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import CopyButton from "@/components/CopyButton";
import PromptCard from "@/components/PromptCard";
import { supabase, SAMPLE_PROMPTS, type Prompt } from "@/lib/supabase";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getPrompt(id: string): Promise<Prompt | null> {
  const { data } = await supabase
    .from("prompts")
    .select("*, categories(*)")
    .eq("id", id)
    .single();

  if (data) return data;

  // Fallback to sample data
  const sample = SAMPLE_PROMPTS.find((p) => p.id === id);
  return sample || null;
}

async function getRelated(categoryId: string, currentId: string): Promise<Prompt[]> {
  const { data } = await supabase
    .from("prompts")
    .select("*, categories(*)")
    .eq("category_id", categoryId)
    .neq("id", currentId)
    .limit(6);

  if (data && data.length > 0) return data;

  return SAMPLE_PROMPTS.filter(
    (p) => p.category_id === categoryId && p.id !== currentId
  ).slice(0, 6);
}

export const revalidate = 60;

// Gradient placeholders per type
const gradientMap: Record<string, string> = {
  Cinematic: "from-purple-900/80 to-blue-900/80",
  "Live-Action": "from-amber-900/80 to-orange-900/80",
  Product: "from-emerald-900/80 to-teal-900/80",
  UGC: "from-pink-900/80 to-rose-900/80",
  "Camera Movement": "from-cyan-900/80 to-sky-900/80",
  Atmospheric: "from-indigo-900/80 to-violet-900/80",
};

export default async function PromptDetailPage({ params }: PageProps) {
  const { id } = await params;
  const prompt = await getPrompt(id);

  if (!prompt) {
    notFound();
  }

  const related = await getRelated(prompt.category_id, prompt.id);
  const gradient = gradientMap[prompt.type || ""] || "from-gray-900/80 to-gray-800/80";
  const hasImage = prompt.image_url || prompt.thumbnail_url;

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-white transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Library
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image preview */}
          <div className="relative aspect-video rounded-xl overflow-hidden bg-[#141414] border border-[#1e1e1e]">
            {hasImage ? (
              <Image
                src={prompt.image_url || prompt.thumbnail_url || ""}
                alt={prompt.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div
                className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}
              >
                <svg
                  className="w-16 h-16 text-white/20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Prompt info */}
          <div>
            <h1 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold text-white mb-4">
              {prompt.title}
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {prompt.type && (
                <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-[#c8ff00]/10 text-[#c8ff00] rounded-full border border-[#c8ff00]/20">
                  {prompt.type}
                </span>
              )}
              {prompt.tags?.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs text-gray-400 bg-white/5 rounded-full border border-white/10"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Camera movement */}
            {prompt.camera_movement && (
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span>Camera: {prompt.camera_movement}</span>
              </div>
            )}

            {/* Copy count */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2"
                />
              </svg>
              Copied {prompt.copy_count.toLocaleString()} times
            </div>

            {/* Prompt text box */}
            <div className="relative bg-[#141414] border border-[#1e1e1e] rounded-xl p-4 mb-4">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">
                {prompt.prompt_text}
              </pre>
            </div>

            <CopyButton text={prompt.prompt_text} />
          </div>
        </div>

        {/* Related prompts */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-[family-name:var(--font-outfit)] text-xl font-semibold text-white mb-6">
              Related Prompts
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((p) => (
                <PromptCard key={p.id} prompt={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
