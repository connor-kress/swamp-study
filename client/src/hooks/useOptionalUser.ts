import { useEffect, useState } from "react";
import { useUserStore } from "../stores/userStore";
import { UserSchema } from "../types";
import { useAuthFetch } from "./useAuthFetch";

export function useOptionalUser() {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);
  const authFetch = useAuthFetch();
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    if (user) {
      setLoading(false);
      return;
    }

    async function verifySession() {
      try {
        const response = await authFetch("/api/auth/verify", { method: "GET" });
        if (!response.ok) {
          setUser(null);
          return;
        }
        const data = await response.json();
        const user = UserSchema.parse(data.user);
        setUser(user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    verifySession();
  }, [user, setUser]);

  return { user, loading };
}
