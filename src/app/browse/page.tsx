"use client";

import { useEffect, useState, useCallback } from "react";
import PromptCard from "@/components/PromptCard";
import {
  supabase,
  SAMPLE_CATEGORIES,
  SAMPLE_PROMPTS,
  type Category,
  type Prompt,
} from "@/lib/supabase";

const PAGE_SIZE = 18;

type SortOption = "newest" | "most_copied" | "featured";

export default function BrowsePage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string>("");
  const [sort, setSort] = useState<SortOption>("newest");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const types = ["Cinematic", "Live-Action", "Product", "UGC", "Camera Movement", "Atmospheric"];

  // Fetch categories
  useEffect(() => {
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*").order("sort_order");
      setCategories(data && data.length > 0 ? data : SAMPLE_CATEGORIES);
    }
    fetchCategories();
  }, []);

  // Fetch prompts
  const fetchPrompts = useCallback(
    async (pageNum: number, append = false) => {
      setLoading(true);

      let query = supabase
        .from("prompts")
        .select("*, categories(*)", { count: "exact" });

      // Search
      if (search.trim()) {
        query = query.or(
          `title.ilike.%${search.trim()}%,prompt_text.ilike.%${search.trim()}%`
        );
      }

      // Category filter
      if (selectedCategories.length > 0) {
        query = query.in("category_id", selectedCategories);
      }

      // Type filter
      if (selectedType) {
        query = query.eq("type", selectedType);
      }

      // Sort
      if (sort === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sort === "most_copied") {
        query = query.order("copy_count", { ascending: false });
      } else if (sort === "featured") {
        query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      }

      // Pagination
      const from = pageNum * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      query = query.range(from, to);

      const { data, count } = await query;

      // Use DB data or fallback
      let results: Prompt[];
      if (data && data.length > 0) {
        results = data;
      } else if (pageNum === 0) {
        // Fallback to sample data with client-side filtering
        results = SAMPLE_PROMPTS.filter((p) => {
          if (search.trim()) {
            const s = search.toLowerCase();
            if (!p.title.toLowerCase().includes(s) && !p.prompt_text.toLowerCase().includes(s)) return false;
          }
          if (selectedCategories.length > 0 && !selectedCategories.includes(p.category_id)) return false;
          if (selectedType && p.type !== selectedType) return false;
          return true;
        });
        if (sort === "most_copied") results.sort((a, b) => b.copy_count - a.copy_count);
        if (sort === "featured") results.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
      } else {
        results = [];
      }

      if (append) {
        setPrompts((prev) => [...prev, ...results]);
      } else {
        setPrompts(results);
      }

      const total = count ?? results.length;
      setHasMore((pageNum + 1) * PAGE_SIZE < total);
      setLoading(false);
    },
    [search, selectedCategories, selectedType, sort]
  );

  // Re-fetch when filters change
  useEffect(() => {
    setPage(0);
    fetchPrompts(0, false);
  }, [fetchPrompts]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPrompts(nextPage, true);
  };

  const toggleCategory = (id: string) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl font-bold text-white mb-2">
            Browse Library
          </h1>
          <p className="text-gray-400">
            Search and filter through thousands of AI video prompts
          </p>
        </div>

        {/* Search + Sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c8ff00]/50 transition-colors"
            />
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-xl text-white focus:outline-none focus:border-[#c8ff00]/50 appearance-none cursor-pointer"
          >
            <option value="newest">Newest</option>
            <option value="most_copied">Most Copied</option>
            <option value="featured">Featured</option>
          </select>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="sm:hidden px-4 py-3 bg-[#141414] border border-[#1e1e1e] rounded-xl text-white flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>

        <div className="flex gap-8">
          {/* Filters sidebar */}
          <aside
            className={`${
              filtersOpen ? "block" : "hidden"
            } sm:block w-full sm:w-56 flex-shrink-0 space-y-6`}
          >
            {/* Category filter */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <label
                    key={cat.id}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(cat.id)}
                      onChange={() => toggleCategory(cat.id)}
                      className="rounded border-gray-600 bg-[#141414] text-[#c8ff00] focus:ring-[#c8ff00]/50"
                    />
                    {cat.name}
                  </label>
                ))}
              </div>
            </div>

            {/* Type filter */}
            <div>
              <h3 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
                Type
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-gray-400 hover:text-white cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    checked={selectedType === ""}
                    onChange={() => setSelectedType("")}
                    className="text-[#c8ff00]"
                  />
                  All Types
                </label>
                {types.map((t) => (
                  <label
                    key={t}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-white cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="type"
                      checked={selectedType === t}
                      onChange={() => setSelectedType(t)}
                      className="text-[#c8ff00]"
                    />
                    {t}
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Prompt grid */}
          <div className="flex-1">
            {loading && prompts.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-[#141414] border border-[#1e1e1e] aspect-[16/10] animate-pulse"
                  />
                ))}
              </div>
            ) : prompts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No prompts found.</p>
                <p className="text-gray-600 text-sm mt-1">
                  Try adjusting your search or filters.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {prompts.map((prompt) => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-10">
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className="px-8 py-3 bg-[#141414] border border-[#1e1e1e] rounded-xl text-white hover:border-[#c8ff00]/30 transition-colors disabled:opacity-50"
                    >
                      {loading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
