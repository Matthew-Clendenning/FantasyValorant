import type { Session, User } from "@supabase/supabase-js";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../services/supabase";

import type { Profile } from "../types/database";

// Required for web browser auth session
WebBrowser.maybeCompleteAuthSession();

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>;
  signInWithDiscord: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /** Fetch user profile from database, create if doesn't exist (for OAuth users) */
  const fetchProfile = useCallback(
    async (userId: string, userMetadata?: Record<string, unknown>) => {
      try {
        console.log("[fetchProfile] Fetching profile for userId:", userId);

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .single();

        console.log("[fetchProfile] Result:", { data, error });

        // Profile exists, return it
        if (data) return data;

        // Profile doesn't exist (PGRST116 = no rows returned)
        if (error?.code === "PGRST116" || !data) {
          // Generate a username from metadata or use fallback
          const username =
            (userMetadata?.name as string)?.replace(/[^a-zA-Z0-9_]/g, "_") ||
            (userMetadata?.full_name as string)?.replace(
              /[^a-zA-Z0-9_]/g,
              "_"
            ) ||
            `user_${userId.substring(0, 8)}`;

          const displayName =
            (userMetadata?.full_name as string) ||
            (userMetadata?.name as string) ||
            username;

          const avatarUrl = userMetadata?.avatar_url as string | undefined;

          // Create profile for OAuth user
          const profileData = {
            id: userId,
            username: username.substring(0, 30),
            display_name: displayName,
            avatar_url: avatarUrl ?? null,
          };

          const { data: newProfile, error: insertError } = await supabase
            .from("profiles")
            .insert(profileData as never)
            .select()
            .single();

          if (insertError) {
            // If username conflict, try with a unique suffix
            if (insertError.code === "23505") {
              const uniqueUsername = `${username.substring(0, 22)}_${Date.now().toString(36)}`;
              const retryData = {
                id: userId,
                username: uniqueUsername,
                display_name: displayName,
                avatar_url: avatarUrl ?? null,
              };

              const { data: retryProfile, error: retryError } = await supabase
                .from("profiles")
                .insert(retryData as never)
                .select()
                .single();

              if (retryError) {
                return null;
              }
              return retryProfile as Profile;
            }
            return null;
          }

          return newProfile as Profile;
        }

        // Other error
        if (error) {
          return null;
        }

        return data;
      } catch {
        return null;
      }
    },
    []
  );

  /** Refresh the current user's profile */
  const refreshProfile = useCallback(async () => {
    if (!state.user) return;
    const profile = await fetchProfile(
      state.user.id,
      state.user.user_metadata
    );
    setState((prev) => ({ ...prev, profile }));
  }, [state.user, fetchProfile]);

  /** Handle auth state changes */
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log("[AuthContext] Initial session:", session?.user?.id);
      console.log("[AuthContext] User metadata:", session?.user?.user_metadata);

      const user = session?.user ?? null;
      const profile = user
        ? await fetchProfile(user.id, user.user_metadata)
        : null;

      console.log("[AuthContext] Fetched profile:", profile);

      setState({
        user,
        session,
        profile,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      let profile = null;

      if (user) {
        try {
          profile = await fetchProfile(user.id, user.user_metadata);
        } catch {
          // Continue without profile - don't block auth
        }
      }

      setState({
        user,
        session,
        profile,
        isLoading: false,
        isAuthenticated: !!session,
      });
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  /** Sign in with email and password */
  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setState((prev) => ({ ...prev, isLoading: false }));
        throw error;
      }
    },
    []
  );

  /** Sign up with email, password, and username */
  const signUpWithEmail = useCallback(
    async (email: string, password: string, username: string) => {
      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username },
          },
        });

        if (error) throw error;
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    []
  );

  /** Sign in with Discord OAuth */
  const signInWithDiscord = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const redirectUrl = AuthSession.makeRedirectUri({
        scheme: "fantasyvalorant",
        path: "auth/callback",
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(
          data.url,
          redirectUrl
        );

        if (result.type === "success" && result.url) {
          const url = new URL(result.url);

          // Check for authorization code flow (code in query params)
          const code = url.searchParams.get("code");

          // Check for implicit flow (tokens in URL fragment)
          const hashParams = new URLSearchParams(url.hash.substring(1));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (code) {
            const { data: sessionData, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) throw exchangeError;

            if (sessionData?.session) {
              const profile = await fetchProfile(
                sessionData.session.user.id,
                sessionData.session.user.user_metadata
              );
              setState({
                user: sessionData.session.user,
                session: sessionData.session,
                profile,
                isLoading: false,
                isAuthenticated: true,
              });
            }
            return;
          } else if (accessToken && refreshToken) {
            const { data: sessionData, error: sessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (sessionError) throw sessionError;

            if (sessionData?.session) {
              let profile = null;
              try {
                profile = await fetchProfile(
                  sessionData.session.user.id,
                  sessionData.session.user.user_metadata
                );
              } catch {
                // Continue without profile
              }

              setState({
                user: sessionData.session.user,
                session: sessionData.session,
                profile,
                isLoading: false,
                isAuthenticated: true,
              });
            }
            return;
          }
        }

        if (result.type === "cancel" || result.type === "dismiss") {
          setState((prev) => ({ ...prev, isLoading: false }));
          return;
        }
      }

      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, [fetchProfile]);

  /** Send password reset email */
  const resetPassword = useCallback(async (email: string) => {
    const redirectUrl = AuthSession.makeRedirectUri({
      scheme: "fantasyvalorant",
      path: "auth/reset-password",
    });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (error) throw error;
  }, []);

  /** Sign out */
  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signOut();

    if (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      signInWithEmail,
      signUpWithEmail,
      signInWithDiscord,
      resetPassword,
      signOut,
      refreshProfile,
    }),
    [
      state,
      signInWithEmail,
      signUpWithEmail,
      signInWithDiscord,
      resetPassword,
      signOut,
      refreshProfile,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook to access auth context */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
