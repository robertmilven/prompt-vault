"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  copiesUsed: number;
  isPaid: boolean;
  canCopy: boolean;
  recordCopy: () => void;
  signOut: () => Promise<void>;
}

const FREE_COPY_LIMIT = 5;
const COPIES_KEY = "pv_copies";
const COPIES_DATE_KEY = "pv_copies_date";

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  copiesUsed: 0,
  isPaid: false,
  canCopy: true,
  recordCopy: () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiesUsed, setCopiesUsed] = useState(0);
  const [isPaid, setIsPaid] = useState(false);

  useEffect(() => {
    const supabase = getSupabase();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPaidStatus(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkPaidStatus(session.user.id);
      } else {
        setIsPaid(false);
      }
    });

    // Load daily copy count from localStorage
    loadCopiesUsed();

    return () => subscription.unsubscribe();
  }, []);

  async function checkPaidStatus(userId: string) {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from("profiles")
        .select("is_paid")
        .eq("id", userId)
        .single();
      setIsPaid(data?.is_paid || false);
    } catch {
      setIsPaid(false);
    }
  }

  function loadCopiesUsed() {
    if (typeof window === "undefined") return;
    const today = new Date().toISOString().split("T")[0];
    const storedDate = localStorage.getItem(COPIES_DATE_KEY);
    if (storedDate !== today) {
      localStorage.setItem(COPIES_DATE_KEY, today);
      localStorage.setItem(COPIES_KEY, "0");
      setCopiesUsed(0);
    } else {
      setCopiesUsed(parseInt(localStorage.getItem(COPIES_KEY) || "0", 10));
    }
  }

  function recordCopy() {
    const newCount = copiesUsed + 1;
    setCopiesUsed(newCount);
    if (typeof window !== "undefined") {
      localStorage.setItem(COPIES_KEY, String(newCount));
    }
  }

  const canCopy = isPaid || copiesUsed < FREE_COPY_LIMIT;

  async function signOut() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsPaid(false);
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, copiesUsed, isPaid, canCopy, recordCopy, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
