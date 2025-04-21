import React, { useState } from "react";
import { Link, NavigateFunction, useNavigate } from "react-router";

import Button from "../components/Button";
import FormInput from "../components/FormInput";
import NavBar from "../components/NavBar";
import SwampStudy from "../components/SwampStudy";
import TermDropdown, { courseTermData } from "../components/TermDropdown";
import { useAuthFetch } from "../hooks/useAuthFetch";
import { Course, NewGroupInput, NewGroupInputSchema, Weekday } from "../types";
import { useFetchCourses } from "../hooks/useFetchCourses";

const daysOfWeek: {
  value: Weekday;
  label: string;
}[] = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

type GroupFormData = {
  name: string;
  classCode: string;
  professor: string;
  term: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  contactDetails: string;
};

export async function attemptCreateGroup(
  groupData: NewGroupInput,
  authFetch: ReturnType<typeof useAuthFetch>,
  navigate: NavigateFunction,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<void> {
  setError("");
  setIsLoading(true);
  try {
    const response = await authFetch("/api/group", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(groupData),
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
    if (data.error) throw new Error(data.error);
    console.log("Group creation successful:", data);
    navigate("/dashboard");
  } catch (err) {
    console.error("Error creating group:", err);
    setError(err instanceof Error ? err.message : "Group creation failed");
  } finally {
    setIsLoading(false);
  }
}

export default function NewGroupScreen() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<GroupFormData>({
    name: "",
    classCode: "",
    professor: "",
    term: courseTermData[0].value,
    meetingDay: "",
    meetingTime: "",
    location: "",
    contactDetails: "",
  });

  const { courses } = useFetchCourses();

  let matches: Course[] = [];
  if (formData.classCode && courses) {
    matches = courses.filter(course =>
      course.code.toLowerCase().startsWith(formData.classCode.toLowerCase())
    );
  }


  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement
                                          | HTMLSelectElement>
  ) {
    let { name, value } = e.target;
    if (name == "classCode") {
      value = value.replace(" ", "").toUpperCase();
    }
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!courses) {
      setError("Error fetching course data.");
      return;
    }
    const course = courses.find(course => course.code === formData.classCode);
    if (!course) {
      setError("No valid course selected (did you create one?)");
      return;
    }
    const termData = courseTermData.find(data => data.value === formData.term);
    if (!termData) {
      setError("Course term not found.");
      return;
    }
    if (formData.meetingDay === "") {
      setError("Please select a meeting day.");
      return;
    }
    console.log("Form data:", formData);
    const groupData = NewGroupInputSchema.parse({
      name: formData.name.trim(),
      course_id: course.id,
      year: termData.year,
      term: termData.term,
      meeting_day: formData.meetingDay.trim(),
      meeting_time: formData.meetingTime.trim(),
      meeting_location: formData.location.trim(),
      contact_details: formData.contactDetails.trim(),
    });
    console.log("Parsed group data:", groupData);
    await attemptCreateGroup(
      groupData, authFetch, navigate, setError, setIsLoading
    );
  }

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center gap-6 px-6 py-8
                      max-w-md mx-auto">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight dark:text-gray-50">
            Create a New Study Group with <SwampStudy />
          </h1>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p>
              Create a study group for your class and connect with
              other students!
            </p>
            <p>Fill out the below fields</p>
          </div>
        </div>

        {error && (
          <div className="w-full p-3 rounded-lg bg-red-50 dark:bg-red-900/30
                          text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Group Name
            </label>
            <FormInput
              type="text"
              id="name"
              name="name"
              placeholder="Name your group"
              value={formData.name}
              onChange={handleInputChange}
              minLength={2}
              required
            />
            <label
              htmlFor="classCode"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Class Code
            </label>
            <FormInput
              type="text"
              id="classCode"
              name="classCode"
              placeholder="e.g. MAC2313"
              value={formData.classCode}
              onChange={handleInputChange}
              minLength={7}
              maxLength={10}
              required
            />

            {/* Show loading state when searching */}
            {formData.classCode.length === 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
              Start typing to search for a class...
              </div>
            )}

            {/* Show search results when classes are found */}
            {matches.length > 0 && (
              <>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {matches.length} class(es) found matching your search.
              </div>

              <div className="space-y-2">
                {matches.map(cls => (
                  <div
                    key={cls.id}
                    className={`p-4 border rounded-lg shadow-sm cursor-pointer
                                transition-all duration-200 ${
                        cls.code === formData.classCode
                          ? "bg-blue-50 border-blue-500 \
                             dark:bg-blue-900/20 dark:border-blue-400"
                          : "hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    onClick={() => {
                      setFormData((prevData) => ({
                        ...prevData,
                        className: cls.name,
                        classCode: cls.code,
                      }));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setFormData((prevData) => ({
                          ...prevData,
                          className: cls.name,
                          classCode: cls.code,
                        }));
                      }
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <h3
                      className={`text-lg font-semibold ${
                        cls.code === formData.classCode
                          ? "text-blue-700 dark:text-blue-300"
                          : "text-gray-800 dark:text-gray-200"
                      }`}
                    >
                      {cls.name}
                    </h3>
                    <p
                      className={`text-sm ${
                        cls.code === formData.classCode
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <span className="font-bold">Course Code:</span>{" "}
                      {cls.code}
                    </p>
                    <p
                      className={`text-sm ${
                        cls.code === formData.classCode
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <span className="font-bold">Professor:</span>{" "}
                      {cls.professor}
                    </p>
                    <p
                      className={`text-sm ${
                        cls.code === formData.classCode
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      <span className="font-bold">Description:</span>{" "}
                      {cls.description}
                    </p>
                  </div>
                ))}
              </div>
              </>
            )}

            {/* Show "no results" when searching but no classes found */}
            {formData.classCode.length > 0 && matches.length === 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                No classes found matching your search.{" "}
                <Link
                  to="/new-class"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Create a new class here
                </Link>
              </div>
            )}

            <label
              htmlFor="term"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Term
            </label>
            <TermDropdown
              id="term"
              name="term"
              value={formData.term}
              onChange={handleInputChange}
            />

            <label
              htmlFor="meetingDay"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Meeting Day
            </label>
            <select
              id="meetingDay"
              name="meetingDay"
              value={formData.meetingDay}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="">Select a day</option>
              {daysOfWeek.map(day => (
                <option key={day.value} value={day.value}>
                  {day.label}
                </option>
              ))}
            </select>

            <label
              htmlFor="meetingTime"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Meeting Time
            </label>
            <FormInput
              type="time"
              id="meetingTime"
              name="meetingTime"
              value={formData.meetingTime}
              onChange={handleInputChange}
            />

            <label
              htmlFor="location"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Meeting Location
            </label>
            <FormInput
              type="text"
              id="location"
              name="location"
              placeholder="e.g. Martson Basement, Library West, etc."
              value={formData.location}
              onChange={handleInputChange}
              minLength={2}
            />

            <label
              htmlFor="contactDetails"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Contact Information
            </label>
            <FormInput
              type="text"
              id="contactDetails"
              name="contactDetails"
              placeholder="Where should new members contact you?"
              value={formData.contactDetails}
              onChange={handleInputChange}
              minLength={3}
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Create
          </Button>
        </form>
      </div>
    </>
  );
}
