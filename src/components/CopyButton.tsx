"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface CopyButtonProps {
  text: string;
  className?: string;
}

const FREE_COPY_LIMIT = 5;

export default function CopyButton({ text, className = "" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const { user, canCopy, copiesUsed, isPaid, recordCopy } = useAuth();

  const handleCopy = async () => {
    if (!canCopy) return;

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      recordCopy();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      recordCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Not logged in - prompt to sign up
  if (!user) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-[#c8ff00] text-black hover:bg-[#d4ff33] transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Sign Up to Copy
        </Link>
        <p className="text-gray-600 text-xs">Free account - no credit card needed</p>
      </div>
    );
  }

  // Hit the free limit
  if (!canCopy) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-gray-800 text-gray-400 cursor-not-allowed">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Daily Limit Reached
        </div>
        <p className="text-gray-500 text-xs">
          You&apos;ve used {FREE_COPY_LIMIT}/{FREE_COPY_LIMIT} free copies today.{" "}
          <Link href="/pricing" className="text-[#c8ff00] hover:underline">
            Upgrade for unlimited
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      <button
        onClick={handleCopy}
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
          copied
            ? "bg-[#c8ff00] text-black"
            : "bg-[#c8ff00]/10 text-[#c8ff00] hover:bg-[#c8ff00]/20 border border-[#c8ff00]/30"
        }`}
      >
        {copied ? (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Copied!
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            Copy Prompt
          </>
        )}
      </button>
      {!isPaid && (
        <p className="text-gray-600 text-[10px]">
          {FREE_COPY_LIMIT - copiesUsed} free copies left today
        </p>
      )}
    </div>
  );
}
