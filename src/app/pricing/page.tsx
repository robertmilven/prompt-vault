"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function PricingPage() {
  const { user, isPaid } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-[family-name:var(--font-outfit)] text-3xl sm:text-4xl font-bold text-white text-center mb-3">
          Simple Pricing
        </h1>
        <p className="text-gray-400 text-center mb-12 max-w-lg mx-auto">
          Start free, upgrade when you need more. No hidden fees.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free tier */}
          <div className="bg-[#141414] border border-[#1e1e1e] rounded-2xl p-6">
            <h3 className="text-white font-semibold text-lg mb-1">Free</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-gray-500 text-sm">forever</span>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                "Browse all 6,000+ prompts",
                "5 copies per day",
                "All categories",
                "Search and filter",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-400">
                  <svg className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            {user ? (
              <div className="w-full py-2.5 text-center text-sm text-gray-500 border border-[#1e1e1e] rounded-xl">
                {isPaid ? "Your previous plan" : "Current plan"}
              </div>
            ) : (
              <Link
                href="/signup"
                className="block w-full py-2.5 text-center text-sm text-white border border-[#1e1e1e] rounded-xl hover:border-white/20 transition-colors"
              >
                Get Started
              </Link>
            )}
          </div>

          {/* Pro tier */}
          <div className="bg-[#141414] border-2 border-[#c8ff00]/30 rounded-2xl p-6 relative">
            <div className="absolute -top-3 left-6 px-3 py-0.5 bg-[#c8ff00] text-black text-xs font-bold rounded-full">
              BEST VALUE
            </div>
            <h3 className="text-white font-semibold text-lg mb-1">Pro</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold text-white">$9</span>
              <span className="text-gray-500 text-sm">/month</span>
            </div>
            <ul className="space-y-3 mb-6">
              {[
                "Everything in Free",
                "Unlimited copies",
                "New prompts first",
                "Priority support",
                "Commercial use license",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-300">
                  <svg className="w-4 h-4 text-[#c8ff00] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>
            {isPaid ? (
              <div className="w-full py-2.5 text-center text-sm text-[#c8ff00] border border-[#c8ff00]/30 rounded-xl">
                Current plan
              </div>
            ) : (
              <button
                className="w-full py-2.5 text-center text-sm text-black font-bold bg-[#c8ff00] rounded-xl hover:bg-[#d4ff33] transition-colors shadow-[0_0_20px_rgba(200,255,0,0.2)] disabled:opacity-50"
                disabled={checkoutLoading}
                onClick={async () => {
                  if (!user) {
                    window.location.href = "/signup";
                    return;
                  }
                  setCheckoutLoading(true);
                  try {
                    const res = await fetch("/api/checkout", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user.id, email: user.email }),
                    });
                    const data = await res.json();
                    if (data.url) {
                      window.location.href = data.url;
                    }
                  } catch {
                    alert("Something went wrong. Please try again.");
                  } finally {
                    setCheckoutLoading(false);
                  }
                }}
              >
                {checkoutLoading ? "Loading..." : user ? "Upgrade to Pro" : "Sign Up to Upgrade"}
              </button>
            )}
          </div>
        </div>

        {/* FAQ below pricing */}
        <div className="mt-16 max-w-2xl mx-auto">
          <h2 className="font-[family-name:var(--font-outfit)] text-xl font-bold text-white mb-6 text-center">
            Questions
          </h2>
          <div className="space-y-3">
            {[
              {
                q: "Can I cancel anytime?",
                a: "Yes. Cancel your Pro subscription at any time and you won't be charged again. You keep Pro access until the end of your billing period."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit and debit cards through Stripe. All payments are secure and encrypted."
              },
              {
                q: "What does 'commercial use license' mean?",
                a: "Pro members can use any AI-generated outputs from our prompts for commercial purposes - client work, ads, social media, products, anything."
              },
            ].map((faq, i) => (
              <details key={i} className="bg-[#141414] border border-[#1e1e1e] rounded-xl group">
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
        </div>
      </div>
    </div>
  );
}
