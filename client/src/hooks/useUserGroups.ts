import { useState, useEffect } from "react";
import { GroupWithMembers, GroupWithMembersSchema } from "../types";
import { useAuthFetch } from "./useAuthFetch";

async function fetchUserGroups(
  userId: number,
  authFetch: ReturnType<typeof useAuthFetch>,
): Promise<GroupWithMembers[] | null> {
  try {
    const response = await authFetch(`/api/group/all/user/${userId}`);

    if (!response.ok) {
      let err = (await response.json())?.error;
      if (typeof err !== "string") {
        console.error(err);
        err = null;
      }
      throw new Error(err ?? "Unknown error");
    }

    const data = await response.json();
    return GroupWithMembersSchema.array().parse(data);
  } catch (err) {
    console.error("Error fetching user groups:", err);
    return null;
  }
}

interface UseUserGroupsResult {
  userGroups: GroupWithMembers[] | null;
  loading: boolean;
  error: string | null;
}

export function useUserGroups(userId: number): UseUserGroupsResult {
  const authFetch = useAuthFetch();
  const [userGroups, setUserGroups] = useState<GroupWithMembers[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setUserGroups(null);
      setLoading(false);
      setError("No user ID provided.");
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedGroups = await fetchUserGroups(userId, authFetch);
        if (fetchedGroups !== null) {
          setUserGroups(fetchedGroups);
        } else {
          setError("Failed to load user groups.");
          setUserGroups(null);
        }
      } catch (err) {
        console.error("Unexpected error fetching user groups:", err);
        setError("An unexpected error occurred.");
        setUserGroups(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId, authFetch]);

  return { userGroups, loading, error };
}
