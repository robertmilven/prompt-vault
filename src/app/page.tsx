import Link from "next/link";
import CategoryRow from "@/components/CategoryRow";
import {
  supabase,
  SAMPLE_CATEGORIES,
  SAMPLE_PROMPTS,
  type Category,
  type Prompt,
} from "@/lib/supabase";

async function getData() {
  // Fetch categories
  const { data: dbCategories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  const categories: Category[] =
    dbCategories && dbCategories.length > 0 ? dbCategories : SAMPLE_CATEGORIES;

  // Fetch prompts per category
  const categoryPrompts: { category: Category; prompts: Prompt[] }[] = [];

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
      categoryPrompts.push({ category: cat, prompts });
    }
  }

  return categoryPrompts;
}

export const revalidate = 60;

export default async function HomePage() {
  const categoryPrompts = await getData();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#c8ff00]/5 rounded-full blur-[120px]" />
        </div>

        <h1 className="font-[family-name:var(--font-outfit)] text-5xl sm:text-7xl font-bold tracking-tight gradient-text mb-6">
          PROMPT VAULT
        </h1>
        <p className="text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
          30,000+ AI Video Prompts. Copy. Paste. Create.
        </p>
        <Link
          href="/browse"
          className="inline-flex items-center gap-2 px-8 py-3 bg-[#c8ff00] text-black font-semibold rounded-lg hover:bg-[#d4ff33] transition-colors text-sm"
        >
          Browse Library
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </Link>

        {/* Stats */}
        <div className="flex items-center justify-center gap-6 sm:gap-10 mt-12 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">30,000+</span> Prompts
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

      {/* Category Rows */}
      <section className="pb-20 max-w-[1400px] mx-auto">
        {categoryPrompts.map(({ category, prompts }) => (
          <CategoryRow
            key={category.id}
            title={category.name}
            prompts={prompts}
          />
        ))}
      </section>
    </div>
  );
}
