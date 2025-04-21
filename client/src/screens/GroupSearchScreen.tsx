import { useMemo, useState } from "react";
import { Link, NavigateFunction, useNavigate } from "react-router";
import {
  ChatBubbleLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  ExclamationCircleIcon,
  MapPinIcon,
  UserGroupIcon,
  UserPlusIcon,
  XMarkIcon,
} from "@heroicons/react/16/solid";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import NavBar from "../components/NavBar";
import SwampStudy from "../components/SwampStudy";
import { useFetchGroups } from "../hooks/useFetchGroups";
import {
  Course,
  GroupWithMemberCount,
  UserGroup,
  UserGroupSchema,
} from "../types";
import { useFetchCourses } from "../hooks/useFetchCourses";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { useAuth } from "../hooks/useAuth";
import { useUserStore } from "../stores/userStore";

export async function attemptJoinGroup(
  groupId: number,
  userId: number,
  authFetch: ReturnType<typeof useAuthFetch>,
  navigate: NavigateFunction,
  onError: (errorMsg: string) => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<void> {
  setIsLoading(true);
  try {
    const response = await authFetch(`/api/group/${groupId}/user/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "member" }),
    });

    if (!response.ok) {
      let err = (await response.json())?.error;
      if (typeof err !== "string") {
        console.error(err);
        err = null;
      }
      throw new Error(err ?? "Unknown error");
    }

    const json = await response.json();
    let userGroup: UserGroup;
    try {
      userGroup = UserGroupSchema.parse(json);
    } catch (validationError) {
      console.error("Invalid response format:", validationError);
      throw new Error("Server returned invalid data format");
    }

    console.log("Successfully joined group:", userGroup);
    navigate("/dashboard");
  } catch (err) {
    console.error("Error joining group:", err);
    onError(err instanceof Error ? err.message : "Failed to join group");
  } finally {
    setIsLoading(false);
  }
}

export default function GroupSearchScreen() {
  useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const { courses } = useFetchCourses();
  const { groups } = useFetchGroups();

  // Filter and organize groups by courses based on search query
  const filteredAndGroupedData = useMemo(() => {
    if (!courses || !groups) return [];

    // First filter courses based on search
    const filteredCourses = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Then create course-group pairs
    return filteredCourses.map((course) => ({
      course,
      groups: groups.filter((group) => group.course_id === course.id),
    }));
  }, [courses, groups, searchQuery]);

  return (
    <>
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          <SwampStudy /> Join Room
        </h1>

        <div className="mb-8">
          <FormInput
            type="text"
            id="search"
            name="search"
            placeholder="Search by class name or code (e.g. COP3502)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {groups && courses ? (
          filteredAndGroupedData.length > 0 ? (
            <div className="space-y-6">
              {filteredAndGroupedData.map(({ course, groups }) => (
                <CourseTab key={course.id} course={course} groups={groups} />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>No courses or groups found matching your search.</p>
              <p className="mt-4">
                Can't find a group?{" "}
                <Link
                  to="/new-group"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create a new one
                </Link>
                .
              </p>
            </div>
          )
        ) : (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

function CourseTab({ course, groups }: {
  course: Course;
  groups: GroupWithMemberCount[];
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-gray-200 dark:border-gray-700
                    rounded-lg overflow-hidden">
      <button
        className="w-full p-4 flex justify-between items-center bg-gray-50
                   dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h2 className="text-xl font-semibold">{course.name}</h2>
          <p className="text-gray-600 dark:text-gray-400">
            {course.code} • {course.professor}
          </p>
        </div>
        {isExpanded ? (
          <ChevronUpIcon className="w-6 h-6" />
        ) : (
          <ChevronDownIcon className="w-6 h-6" />
        )}
      </button>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {groups.length > 0 ? (
            groups.map((group) => <GroupCard key={group.id} group={group} />)
          ) : (
            <p className="text-gray-600 dark:text-gray-400 text-center">
              No study groups available for this course.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Format time with proper padding
function formatTime(time: Date) {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // 24h -> 12h format
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Format day to be capitalized
function formatDay(day: string) {
  return day.charAt(0).toUpperCase() + day.slice(1);
};

function GroupCard({ group }: { group: GroupWithMemberCount }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const user = useUserStore(state => state.user);

  async function handleJoinGroup() {
    if (!user) {
      setError("You must be logged in to join a group");
      return;
    }

    setError(null);
    await attemptJoinGroup(
      group.id,
      user.id,
      authFetch,
      navigate,
      setError,
      setIsLoading
    );
  };

  function handleCloseError() {
    setError(null);
  };

  return (
    <div
      className="p-6 border border-gray-200 dark:border-gray-700
                 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800
                 transition-colors shadow-sm relative"
    >
      {/* Error Toast */}
      {error && (
        <div className="absolute top-0 left-0 right-0
                        transform -translate-y-full p-2">
          <div className="bg-red-100 border border-red-400 text-red-700
                          px-4 py-3 rounded flex justify-between items-center">
            <div className="flex items-center">
              <ExclamationCircleIcon className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
            <button
              onClick={handleCloseError}
              className="text-red-700 hover:text-red-900"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Meeting Information and Contact Details */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
          <div className="space-y-2">
            {group.meeting_day && group.meeting_time && (
              <div className="flex items-center
                              text-gray-600 dark:text-gray-400">
                <ClockIcon className="w-5 h-5 mr-2" />
                <span>
                  {formatDay(group.meeting_day)}s at{" "}
                  {formatTime(group.meeting_time)}
                </span>
              </div>
            )}
            {group.meeting_location && (
              <div className="flex items-center
                              text-gray-600 dark:text-gray-400">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>{group.meeting_location}</span>
              </div>
            )}
            <div className="flex items-center
                            text-gray-600 dark:text-gray-400">
              <ChatBubbleLeftIcon className="w-5 h-5 mr-2" />
              <span>{group.contact_details}</span>
            </div>
          </div>
        </div>
        <Button
          variant="primary"
          className="flex items-center gap-2"
          onClick={handleJoinGroup}
          isLoading={isLoading}
          disabled={isLoading}
        >
          <UserPlusIcon className="w-5 h-5" />
          Join Group
        </Button>
      </div>

      {/* Member count */}
      <div className="mt-4 pt-4 border-t border-gray-200
                      dark:border-gray-700">
        <div className="flex items-center text-sm
                        text-gray-500 dark:text-gray-400">
          <UserGroupIcon className="w-4 h-4 mr-1" />
          {group.member_count === 0 && (
            <span>No members</span>
          ) || (
            <span>
              {group.member_count} member{group.member_count === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
