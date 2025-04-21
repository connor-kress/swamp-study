import { useState } from "react";
import { Link } from "react-router";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import NavBar from "../components/NavBar";
import SwampStudy from "../components/SwampStudy";
import { useFetchGroups } from "../hooks/useFetchGroups";
import { Course, Group } from "../types";
import { useFetchCourses } from "../hooks/useFetchCourses";

export default function GroupSearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { courses } = useFetchCourses();
  const { groups } = useFetchGroups();

  // Filter groups based on search query
  let filteredGroups: Group[] = [];
  if (groups && courses) {
    filteredGroups = groups.filter(group => {
      const course = courses.find(course => course.id === group.course_id);
      if (!course) return false;
      return (
        course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.code.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }

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

        {groups && courses && (
          filteredGroups.length > 0 ? (
            <div className="space-y-4">
              {filteredGroups.map(group => (
                <GroupCard group={group} courses={courses}/>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-600 dark:text-gray-400">
              <p>No groups found matching your search.</p>
              <p className="mt-4">
                Can't find a group?{" "}
                <Link
                  to="/new-group"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create a new one
                </Link>.
              </p>
            </div>
          )
        ) || (
          <div>Loading...</div>
        )}
      </div>
    </>
  );
}

function GroupCard({ group, courses }: { group: Group, courses: Course[] }) {
  const course = courses.find(course => course.id === group.course_id);
  if (!course) {
    throw new Error("Group should always have associated course");
  }

  return (
    <div
      key={group.id}
      className="p-4 border border-gray-200 dark:border-gray-700
                 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800
                 transition-colors"
    >
      <h3 className="text-xl font-semibold">
        {course.name}
      </h3>
      <div className="mt-2 space-y-1">
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-medium">Code:</span>{" "}
          {course.code}
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          <span className="font-medium">Professor:</span>{" "}
          {course.professor}
        </p>
        {group.meeting_location && (
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Location:</span>{" "}
            {group.meeting_location}
          </p>
        )}
        {group.meeting_day && group.meeting_time && (
          <p className="text-gray-600 dark:text-gray-400">
            <span className="font-medium">Time:</span>{" "}
            {group.meeting_time.getHours()}:{group.meeting_time.getMinutes()}
          </p>
        )}
      </div>
      <div className="mt-4">
        <Button variant="primary">
          Join Group
        </Button>
      </div>
    </div>
  );
}
