import { useNavigate } from "react-router";

export function useAuthFetch() {
  const navigate = useNavigate();

  async function authFetch(
    input: RequestInfo,
    init?: RequestInit,
    redirectOnFail: boolean = true
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
        if (redirectOnFail) {
          navigate("/login");
        }
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
  }

  return authFetch;
}
