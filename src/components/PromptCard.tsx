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
            <div className="w-full h-full bg-[#111] flex flex-col items-center justify-center gap-2 border-b border-[#1e1e1e]">
              <svg
                className="w-8 h-8 text-[#c8ff00]/30"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                />
              </svg>
              <span className="text-[10px] font-medium uppercase tracking-widest text-white/25">Text Prompt</span>
            </div>
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
