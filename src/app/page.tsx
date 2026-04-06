"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CategoryRow from "@/components/CategoryRow";
import {
  getSupabase,
  SAMPLE_CATEGORIES,
  SAMPLE_PROMPTS,
  type Category,
  type Prompt,
} from "@/lib/supabase";

interface CategoryData {
  category: Category;
  prompts: Prompt[];
}

export default function HomePage() {
  const [categoryPrompts, setCategoryPrompts] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const supabase = getSupabase();
        const { data: dbCategories } = await supabase
          .from("categories")
          .select("*")
          .order("sort_order");

        const categories: Category[] =
          dbCategories && dbCategories.length > 0 ? dbCategories : SAMPLE_CATEGORIES;

        const results: CategoryData[] = [];

        for (const cat of categories) {
          const { data: dbPrompts } = await supabase
            .from("prompts")
            .select("*, categories(*)")
            .eq("category_id", cat.id)
            .order("created_at", { ascending: false })
            .limit(10);

          const prompts =
            dbPrompts && dbPrompts.length > 0
              ? dbPrompts
              : SAMPLE_PROMPTS.filter((p) => p.category_id === cat.id);

          if (prompts.length > 0) {
            results.push({ category: cat, prompts });
          }
        }

        setCategoryPrompts(results);
      } catch {
        // Fallback to sample data
        const results: CategoryData[] = [];
        for (const cat of SAMPLE_CATEGORIES) {
          const prompts = SAMPLE_PROMPTS.filter((p) => p.category_id === cat.id);
          if (prompts.length > 0) {
            results.push({ category: cat, prompts });
          }
        }
        setCategoryPrompts(results);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#c8ff00]/5 rounded-full blur-[120px]" />
        </div>

        {/* Animated Logo */}
        <div className="perspective-[800px] mb-6">
          <h1
            className="font-[family-name:var(--font-outfit)] text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight animate-logo-float"
            style={{
              background: 'linear-gradient(135deg, #c8ff00 0%, #fff 25%, #c8ff00 50%, #ffd700 75%, #c8ff00 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite, float 6s ease-in-out infinite',
              filter: 'drop-shadow(0 0 30px rgba(200,255,0,0.4)) drop-shadow(0 0 60px rgba(200,255,0,0.15))',
              textShadow: 'none',
            }}
          >
            PROMPT<br />VAULT
          </h1>
        </div>

        <p className="text-xl sm:text-2xl text-white font-semibold max-w-3xl mx-auto mb-3">
          Stop writing prompts from scratch.
        </p>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          The largest collection of ready-to-use AI video and image prompts. Copy one, paste it into your favourite AI tool, and get cinematic results in seconds.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c8ff00] text-black font-bold rounded-lg hover:bg-[#d4ff33] transition-colors text-sm shadow-[0_0_20px_rgba(200,255,0,0.3)]"
          >
            Browse 5,000+ Prompts
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <span className="text-xs text-gray-500">No signup required</span>
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">5,300+</span> Prompts
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">6</span> Categories
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            Updated <span className="text-white font-semibold">Weekly</span>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#c8ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Copy and Paste</h3>
            <p className="text-gray-500 text-xs leading-relaxed">Every prompt is ready to use. One click to copy, paste into any AI tool.</p>
          </div>
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#c8ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2m0 2a2 2 0 100 4m0-4a2 2 0 110 4m10-4V2m0 2a2 2 0 100 4m0-4a2 2 0 110 4M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Organised by Style</h3>
            <p className="text-gray-500 text-xs leading-relaxed">Cinematic, product, atmospheric, UGC and more. Find the right prompt fast.</p>
          </div>
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-xl p-5 text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-[#c8ff00]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#c8ff00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">New Prompts Weekly</h3>
            <p className="text-gray-500 text-xs leading-relaxed">Library grows every week with fresh prompts for the latest AI models.</p>
          </div>
        </div>
      </section>

      {/* Category Rows */}
      <section className="pb-20 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#c8ff00] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          categoryPrompts.map(({ category, prompts }) => (
            <CategoryRow key={category.id} title={category.name} prompts={prompts} />
          ))
        )}
      </section>
    </div>
  );
}
