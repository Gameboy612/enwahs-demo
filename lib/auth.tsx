"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS } from "@/lib/constants";
import type { AuthSession } from "@/lib/types";

type AuthContextValue = {
  session: AuthSession | null;
  ready: boolean;
  signIn: (memberId: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function isSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<AuthSession>;
  return typeof session.memberId === "string" && typeof session.signedInAt === "string";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEYS.auth);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (isSession(parsed)) setSession(parsed);
      }
    } catch {
      // Ignore malformed or unavailable storage.
    }
    setReady(true);
  }, []);

  const signIn = useCallback((memberId: string) => {
    const next: AuthSession = {
      memberId,
      signedInAt: new Date().toISOString(),
    };
    setSession(next);
    try {
      window.localStorage.setItem(STORAGE_KEYS.auth, JSON.stringify(next));
    } catch {
      // In-memory session still works.
    }
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    try {
      window.localStorage.removeItem(STORAGE_KEYS.auth);
    } catch {
      // Ignore storage failures.
    }
  }, []);

  const value = useMemo(
    () => ({ session, ready, signIn, signOut }),
    [session, ready, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
