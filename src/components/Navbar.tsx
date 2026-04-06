"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, loading, isPaid, signOut } = useAuth();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <div className="hidden md:flex items-center gap-6">
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

            {!loading && (
              <>
                {user ? (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setMenuOpen(!menuOpen)}
                      className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-[#c8ff00]/20 flex items-center justify-center text-[#c8ff00] text-xs font-bold">
                        {user.email?.[0].toUpperCase()}
                      </div>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#141414] border border-[#1e1e1e] rounded-xl shadow-xl py-1">
                        <div className="px-4 py-2 border-b border-[#1e1e1e]">
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          <p className="text-xs mt-1">
                            {isPaid ? (
                              <span className="text-[#c8ff00] font-semibold">Pro</span>
                            ) : (
                              <span className="text-gray-400">Free plan</span>
                            )}
                          </p>
                        </div>
                        {!isPaid && (
                          <Link
                            href="/pricing"
                            onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-[#c8ff00] hover:bg-white/5 transition-colors"
                          >
                            Upgrade to Pro
                          </Link>
                        )}
                        <button
                          onClick={() => { signOut(); setMenuOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
                        >
                          Sign out
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Link
                      href="/login"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      href="/signup"
                      className="text-sm px-4 py-1.5 bg-[#c8ff00] text-black font-semibold rounded-lg hover:bg-[#d4ff33] transition-colors"
                    >
                      Sign Up Free
                    </Link>
                  </div>
                )}
              </>
            )}
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
          {!loading && (
            <>
              {user ? (
                <>
                  <div className="border-t border-[#1e1e1e] pt-3">
                    <p className="text-xs text-gray-500 mb-2">{user.email}</p>
                    {!isPaid && (
                      <Link
                        href="/pricing"
                        onClick={() => setMobileOpen(false)}
                        className="block text-sm text-[#c8ff00] mb-2"
                      >
                        Upgrade to Pro
                      </Link>
                    )}
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-[#1e1e1e] pt-3 space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-gray-400 hover:text-white"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-[#c8ff00] font-semibold"
                  >
                    Sign Up Free
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </nav>
  );
}
