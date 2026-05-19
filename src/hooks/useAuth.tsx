import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (
    usernameOrEmail: string,
    password: string
  ) => Promise<{ error: any; isAdmin: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

async function checkIsAdmin(userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.log("Admin check error:", error.message);
    return false;
  }

  return !!data?.some((row) => row.role === "admin");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  async function signIn(usernameOrEmail: string, password: string) {
    const loginValue = usernameOrEmail.trim().toLowerCase();

    const email =
      loginValue === "admin"
        ? "admin@admin.com"
        : loginValue;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return { error, isAdmin: false };
    }

    const admin = await checkIsAdmin(data.user.id);

    setUser(data.user);
    setSession(data.session);
    setIsAdmin(admin);

    return { error: null, isAdmin: admin };
  }

  async function signOut() {
    await supabase.auth.signOut();

    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const admin = await checkIsAdmin(currentSession.user.id);
          setIsAdmin(admin);
        } else {
          setIsAdmin(false);
        }
      }
    );

    supabase.auth.getSession().then(async ({ data }) => {
      const currentSession = data.session;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        const admin = await checkIsAdmin(currentSession.user.id);
        setIsAdmin(admin);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
}
