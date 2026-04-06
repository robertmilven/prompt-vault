"use client";

import { useRef, useState, useEffect } from "react";
import PromptCard from "./PromptCard";
import type { Prompt } from "@/lib/supabase";

const CATEGORY_ICONS: Record<string, string> = {
  'Cinematic': '/assets/icons/cinematic.png',
  'Live-Action': '/assets/icons/live-action.png',
  'Product': '/assets/icons/product.png',
  'UGC': '/assets/icons/ugc.png',
  'Camera Movements': '/assets/icons/camera-movements.png',
  'Atmospheric': '/assets/icons/atmospheric.png',
};

interface CategoryRowProps {
  title: string;
  prompts: Prompt[];
}

export default function CategoryRow({ title, prompts }: CategoryRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (prompts.length === 0) return null;

  return (
    <section className="mb-10">
      <h2 className="font-[family-name:var(--font-outfit)] text-xl font-semibold text-white mb-4 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        {CATEGORY_ICONS[title] && (
          <img src={CATEGORY_ICONS[title]} alt="" className="w-8 h-8 object-contain drop-shadow-[0_0_8px_rgba(200,255,0,0.4)]" />
        )}
        {title}
      </h2>
      <div className="relative group/row">
        {/* Left arrow */}
        {canScrollLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-r from-[#0a0a0a] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto hide-scrollbar px-4 sm:px-6 lg:px-8"
        >
          {prompts.map((prompt) => (
            <div key={prompt.id} className="flex-shrink-0 w-[260px] sm:w-[280px]">
              <PromptCard prompt={prompt} />
            </div>
          ))}
        </div>

        {/* Right arrow */}
        {canScrollRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-l from-[#0a0a0a] to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </section>
  );
}
