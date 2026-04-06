"use client";

import Link from "next/link";
import Image from "next/image";
import type { Prompt } from "@/lib/supabase";

interface PromptCardProps {
  prompt: Prompt;
}

// Gradient placeholders per type
const gradientMap: Record<string, string> = {
  Cinematic: "from-purple-900/80 to-blue-900/80",
  "Live-Action": "from-amber-900/80 to-orange-900/80",
  Product: "from-emerald-900/80 to-teal-900/80",
  UGC: "from-pink-900/80 to-rose-900/80",
  "Camera Movement": "from-cyan-900/80 to-sky-900/80",
  Atmospheric: "from-indigo-900/80 to-violet-900/80",
};

export default function PromptCard({ prompt }: PromptCardProps) {
  const gradient = gradientMap[prompt.type || ""] || "from-gray-900/80 to-gray-800/80";
  const hasImage = prompt.thumbnail_url || prompt.image_url;

  return (
    <Link href={`/prompt/${prompt.id}`} className="block">
      <div className="prompt-card relative rounded-xl overflow-hidden bg-[#141414] border border-[#1e1e1e] group cursor-pointer">
        {/* Image / Placeholder */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {hasImage ? (
            <Image
              src={prompt.thumbnail_url || prompt.image_url || ""}
              alt={prompt.title}
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <Image
              src="/no-image.jpg"
              alt="No preview available"
              fill
              className="object-cover"
              loading="lazy"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          )}

          {/* Type badge */}
          {prompt.type && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-black/60 backdrop-blur-sm text-white rounded-md border border-white/10">
              {prompt.type}
            </span>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center">
            <span className="text-white font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#c8ff00]/90 text-black px-4 py-2 rounded-lg">
              View Prompt
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-white truncate">
            {prompt.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1 truncate">
            {prompt.prompt_text.slice(0, 60)}...
          </p>
        </div>
      </div>
    </Link>
  );
}
