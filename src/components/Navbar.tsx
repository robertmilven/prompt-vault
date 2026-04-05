"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="font-[family-name:var(--font-outfit)] text-xl font-bold tracking-wider text-white">
              PROMPT<span className="text-[#c8ff00]"> VAULT</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="/browse"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/browse"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/browse"
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            >
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
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {mobileOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0a0a0a]/95 backdrop-blur-lg border-t border-white/5 px-4 py-4 space-y-3">
          <Link
            href="/browse"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-gray-400 hover:text-white"
          >
            Browse
          </Link>
          <Link
            href="/browse"
            onClick={() => setMobileOpen(false)}
            className="block text-sm text-gray-400 hover:text-white"
          >
            Categories
          </Link>
        </div>
      )}
    </nav>
  );
}
