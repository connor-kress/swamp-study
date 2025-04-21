import { useState, useEffect } from "react";
import { Course, CourseSchema } from "../types";
import { useAuthFetch } from "./useAuthFetch";

export async function fetchCourses(
  authFetch: ReturnType<typeof useAuthFetch>,
): Promise<Course[] | null> {
  try {
    const response = await authFetch("/api/course", {
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
    return CourseSchema.array().parse(data);
  } catch (err) {
    console.error("Error fetching courses:", err);
    return null;
  }
}

interface UseFetchCoursesResult {
  courses: Course[] | null;
  loading: boolean;
  error: string | null;
}

export function useFetchCourses(): UseFetchCoursesResult {
  const authFetch = useAuthFetch();

  const [courses, setCourses] = useState<Course[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedCourses = await fetchCourses(authFetch);
        if (fetchedCourses !== null) {
          setCourses(fetchedCourses);
        } else {
          setError('Failed to load courses.');
          setCourses(null);
        }
      } catch (err) {
        console.error('Unexpected error fetching courses:', err);
        setError('An unexpected error occurred.');
        setCourses(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();

  }, [authFetch]);

  return { courses, loading, error };
}
