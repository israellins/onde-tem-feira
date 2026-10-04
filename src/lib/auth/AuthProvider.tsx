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
import type { User } from "@supabase/supabase-js";
import {
  getSupabaseBrowserClient,
  isSupabaseConfigured,
  type TypedSupabaseClient,
} from "@/lib/supabase/client";
import { PHOTO_BUCKET } from "@/lib/repositories/posts";
import type { Profile } from "@/types/community";

interface AuthContextValue {
  /** false quando o Supabase não está configurado (recursos online desligados). */
  enabled: boolean;
  /** true até a sessão salva ser verificada. */
  loading: boolean;
  supabase: TypedSupabaseClient | null;
  user: User | null;
  profile: Profile | null;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  signInWithGoogle: () => Promise<void>;
  /** Envia um link de acesso por e-mail (sem senha). */
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function redirectUrl(): string {
  return `${window.location.origin}${window.location.pathname}`;
}

async function loadProfile(supabase: TypedSupabaseClient, userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, display_name, avatar_url, is_admin")
    .eq("id", userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    displayName: data.display_name,
    avatarUrl: data.avatar_url,
    isAdmin: data.is_admin,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    // onAuthStateChange dispara INITIAL_SESSION logo ao assinar, então não é
    // preciso chamar getSession() separadamente.
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        setIsAuthModalOpen(false);
        // Fora do callback para não bloquear o cliente de auth.
        setTimeout(() => {
          loadProfile(supabase, nextUser.id).then((p) => {
            if (!active) return;
            setProfile(p);
            setLoading(false);
          });
        }, 0);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectUrl() },
    });
    if (error) throw error;
  }, [supabase]);

  const signInWithEmail = useCallback(
    async (email: string) => {
      if (!supabase) return;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectUrl(), shouldCreateUser: true },
      });
      if (error) throw error;
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, [supabase]);

  const deleteAccount = useCallback(async () => {
    if (!supabase || !user) return;
    // 1) Apaga as fotos do usuário (o banco não alcança o Storage).
    const { data: files } = await supabase.storage
      .from(PHOTO_BUCKET)
      .list(user.id, { limit: 1000 });
    if (files && files.length > 0) {
      await supabase.storage.from(PHOTO_BUCKET).remove(files.map((f) => `${user.id}/${f.name}`));
    }
    // 2) Apaga a conta e, em cascata, todos os dados.
    const { error } = await supabase.rpc("delete_my_account");
    if (error) throw error;
    await supabase.auth.signOut({ scope: "local" });
  }, [supabase, user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      enabled: isSupabaseConfigured,
      loading,
      supabase,
      user,
      profile,
      isAuthModalOpen,
      openAuthModal: () => setIsAuthModalOpen(true),
      closeAuthModal: () => setIsAuthModalOpen(false),
      signInWithGoogle,
      signInWithEmail,
      signOut,
      deleteAccount,
    }),
    [
      loading,
      supabase,
      user,
      profile,
      isAuthModalOpen,
      signInWithGoogle,
      signInWithEmail,
      signOut,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth precisa estar dentro de <AuthProvider>");
  return ctx;
}
