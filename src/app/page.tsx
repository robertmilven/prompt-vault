"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import CategoryRow from "@/components/CategoryRow";
import PromptCard from "@/components/PromptCard";
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

interface Stats {
  totalPrompts: number;
  totalCategories: number;
  totalCopied: number;
}

export default function HomePage() {
  const [categoryPrompts, setCategoryPrompts] = useState<CategoryData[]>([]);
  const [featuredPrompts, setFeaturedPrompts] = useState<Prompt[]>([]);
  const [stats, setStats] = useState<Stats>({ totalPrompts: 6000, totalCategories: 8, totalCopied: 0 });
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

        // Get stats
        const { count: promptCount } = await supabase
          .from("prompts")
          .select("*", { count: "exact", head: true });

        const { data: copyData } = await supabase
          .from("prompts")
          .select("copy_count");

        const totalCopied = copyData?.reduce((sum, p) => sum + (p.copy_count || 0), 0) || 0;

        setStats({
          totalPrompts: promptCount || 6000,
          totalCategories: categories.length,
          totalCopied,
        });

        // Get featured prompts (best images for showcase)
        const { data: featured } = await supabase
          .from("prompts")
          .select("*, categories(*)")
          .not("thumbnail_url", "is", null)
          .order("copy_count", { ascending: false })
          .limit(6);

        if (featured && featured.length > 0) {
          setFeaturedPrompts(featured);
        }

        const results: CategoryData[] = [];

        for (const cat of categories) {
          const { data: withImages } = await supabase
            .from("prompts")
            .select("*, categories(*)")
            .eq("category_id", cat.id)
            .not("thumbnail_url", "is", null)
            .order("created_at", { ascending: false })
            .limit(10);

          const imageCount = withImages?.length || 0;
          let textOnly: Prompt[] = [];
          if (imageCount < 10) {
            const { data: extras } = await supabase
              .from("prompts")
              .select("*, categories(*)")
              .eq("category_id", cat.id)
              .is("thumbnail_url", null)
              .order("created_at", { ascending: false })
              .limit(10 - imageCount);
            textOnly = extras || [];
          }

          const dbPrompts = [...(withImages || []), ...textOnly];

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
      {/* ═══ HERO ═══ */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#c8ff00]/5 rounded-full blur-[120px]" />
        </div>

        <div className="perspective-[800px] mb-6">
          <h1
            className="font-[family-name:var(--font-outfit)] text-6xl sm:text-8xl lg:text-9xl font-black tracking-tight"
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
          Create pro-quality AI content in seconds.
        </p>
        <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8">
          {stats.totalPrompts.toLocaleString()}+ tested prompts for AI video, images, and text. Copy one, paste it into any AI tool, and get results that actually look good.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c8ff00] text-black font-bold rounded-lg hover:bg-[#d4ff33] transition-colors text-sm shadow-[0_0_20px_rgba(200,255,0,0.3)]"
          >
            Browse the Library
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <span className="text-xs text-gray-500">No signup required</span>
        </div>

        {/* Live stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{stats.totalPrompts.toLocaleString()}+</span> Prompts
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{stats.totalCategories}</span> Categories
          </div>
          <div className="w-px h-4 bg-gray-700" />
          <div className="flex items-center gap-2">
            Updated <span className="text-white font-semibold">Weekly</span>
          </div>
        </div>
      </section>

      {/* ═══ FEATURED PROMPTS ═══ */}
      {featuredPrompts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-white mb-6 text-center">
            Most Popular Prompts
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {featuredPrompts.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} />
            ))}
          </div>
        </section>
      )}

      {/* ═══ VALUE PROPS ═══ */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-white font-semibold text-sm mb-1">Tested and Proven</h3>
            <p className="text-gray-500 text-xs leading-relaxed">Every prompt has been tested with real AI tools. No guesswork, just results.</p>
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

      {/* ═══ WHAT'S INSIDE ═══ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white mb-2 text-center">
          What&apos;s Inside
        </h2>
        <p className="text-gray-500 text-sm text-center mb-8">
          {stats.totalCategories} categories covering every type of AI content
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {categoryPrompts.map(({ category, prompts }) => (
            <Link
              key={category.id}
              href="/browse"
              className="flex items-center gap-4 bg-[#141414] border border-[#1e1e1e] rounded-xl p-4 hover:border-[#c8ff00]/30 transition-colors group"
            >
              {prompts[0]?.thumbnail_url ? (
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <Image
                    src={prompts[0].thumbnail_url}
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
                  <Image
                    src="/no-image.jpg"
                    alt={category.name}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-semibold text-sm group-hover:text-[#c8ff00] transition-colors">
                  {category.name}
                </h3>
                <p className="text-gray-500 text-xs truncate">
                  {category.description}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[#c8ff00] font-semibold text-sm">{prompts.length > 9 ? '100s' : prompts.length}</span>
                <p className="text-gray-600 text-[10px]">prompts</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ CATEGORY ROWS ═══ */}
      <section className="pb-16 max-w-[1400px] mx-auto">
        <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white mb-8 text-center px-4">
          Browse by Category
        </h2>
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

      {/* ═══ FAQ ═══ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <h2 className="font-[family-name:var(--font-outfit)] text-2xl font-bold text-white mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {[
            {
              q: "What AI tools do these prompts work with?",
              a: "All of them. The image and video prompts work with Midjourney, DALL-E, Stable Diffusion, Runway, Kling, Sora, and any other AI generator. The LLM prompts work with ChatGPT, Claude, Gemini, and similar tools."
            },
            {
              q: "Can I use the outputs commercially?",
              a: "Yes. The prompts themselves are text - you own whatever you generate with them. Use the AI outputs for client work, social media, ads, or anything else."
            },
            {
              q: "How often do you add new prompts?",
              a: "New prompts are added weekly. We test them with the latest AI models before adding them to the library."
            },
            {
              q: "What's the difference between the categories?",
              a: "Image and video categories (Cinematic, Product, Atmospheric, etc.) are for visual AI tools. LLM Prompts are instructions for text AI like ChatGPT. Prompt Generators are meta-prompts that help you create better prompts yourself."
            },
            {
              q: "Do I need to sign up?",
              a: "No. You can browse and copy prompts right now without creating an account."
            },
          ].map((faq, i) => (
            <details
              key={i}
              className="bg-[#141414] border border-[#1e1e1e] rounded-xl group"
            >
              <summary className="flex items-center justify-between p-4 cursor-pointer text-white font-medium text-sm hover:text-[#c8ff00] transition-colors list-none">
                {faq.q}
                <svg className="w-4 h-4 text-gray-500 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-4 pb-4 text-gray-400 text-sm leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ═══ FINAL CTA ═══ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 text-center">
        <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-8 sm:p-12 relative overflow-hidden">
          <div className="absolute inset-0 -z-10">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-[#c8ff00]/5 rounded-full blur-[80px]" />
          </div>
          <h2 className="font-[family-name:var(--font-outfit)] text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to level up your AI content?
          </h2>
          <p className="text-gray-400 text-sm mb-6 max-w-lg mx-auto">
            Stop spending hours writing prompts that don&apos;t work. Browse {stats.totalPrompts.toLocaleString()}+ proven prompts and start creating better content today.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#c8ff00] text-black font-bold rounded-lg hover:bg-[#d4ff33] transition-colors text-sm shadow-[0_0_20px_rgba(200,255,0,0.3)]"
          >
            Start Browsing
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  );
}
