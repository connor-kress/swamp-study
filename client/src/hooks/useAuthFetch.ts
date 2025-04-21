import { useCallback } from "react";
import { useNavigate } from "react-router";

export function useAuthFetch() {
  const navigate = useNavigate();

  const authFetch = useCallback(
    async function (
      input: RequestInfo,
      init?: RequestInit,
    ): Promise<Response> {
      let response = await fetch(input, {
        ...init,
        credentials: "include",
      });

      if (response.status === 401) {
        console.warn("Access token expired, attempting refresh...");
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (!refreshResponse.ok) {
          const data = await refreshResponse.json();
          throw new Error(
            `Unable to refresh token: ${data?.error || "Unknown error"}`
          );
        }

        response = await fetch(input, {
          ...init,
          credentials: "include",
        });
      }
      return response;
    },
    [navigate]
  );

  return authFetch;
}
