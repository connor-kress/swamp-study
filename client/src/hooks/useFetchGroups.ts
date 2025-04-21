import { useState, useEffect } from "react";
import { Group, GroupSchema } from "../types";
import { useAuthFetch } from "./useAuthFetch";

export async function fetchGroups(
  authFetch: ReturnType<typeof useAuthFetch>,
): Promise<Group[] | null> {
  try {
    const response = await authFetch("/api/group", {
      method: "GET",
    });

    if (!response.ok) {
      let err = (await response.json())?.error;
      if (typeof err !== "string") {
        console.error(err);
        err = null;
      }
      throw new Error(err ?? "Unknown error");
    }

    const data = await response.json();
    return GroupSchema.array().parse(data);
  } catch (err) {
    console.error("Error fetching groups:", err);
    return null;
  }
}

interface UseFetchGroupsResult {
  groups: Group[] | null;
  loading: boolean;
  error: string | null;
}

export function useFetchGroups(): UseFetchGroupsResult {
  const authFetch = useAuthFetch();

  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedGroups = await fetchGroups(authFetch);
        if (fetchGroups !== null) {
          setGroups(fetchedGroups);
        } else {
          setError('Failed to load groups.');
          setGroups(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching groups:', err);
        setError('An unexpected error occurred.');
        setGroups(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [authFetch]);

  return { groups, loading, error };
}
