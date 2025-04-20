import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import NavBar from "../components/NavBar";
import SwampStudy from "../components/SwampStudy";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import TermDropdown from "../components/TermDropdown";

type StudyGroupFormData = {
  groupName: string;
  className: string;
  classCode: string;
  professor: string;
  term: string;
  description: string;
  meetingDay: string;
  meetingTime: string;
  location: string;
  groupCreatorContact: string;
}

const mockClasses = [
  { 
    id: 1, 
    className: "Calculus 3",
    classCode: "MAC2313",
    classDescription: "Calculus 3 is a course that covers multivariable calculus, including partial derivatives, multiple integrals, and vector calculus.",
    professor: "NOT ASSIGNED",
    term: "Spring 2025",
  },
  { 
    id: 2, 
    className: "Integrated Principles of Biology 1",
    classCode: "BSC2010",
    classDescription: "Integrated Principles of Biology 1 is a course that covers the principles of biology, including cell biology, genetics, and evolution.",
    professor: "NOT ASSIGNED",
    term: "Spring 2025",
  },
  { 
    id: 3, 
    className: "Calculus 2",
    classCode: "MAC2312",
    classDescription: "Calculus 2 is a course that covers techniques of integration, sequences, and series.",
    professor: "NOT ASSIGNED",
    term: "Spring 2025",
  },
];

export default function NewGroupScreen() {
  // Redirect to login screen when signed out
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<StudyGroupFormData>({
    groupName: "",
    className: "",
    classCode: "",
    professor: "",
    term: "",
    description: "",
    meetingDay: "",
    meetingTime: "",
    location: "",
    groupCreatorContact: "",
  });

  const selectedClass = searchQuery
    ? mockClasses.filter(group =>
        group.classCode.toLowerCase().startsWith(searchQuery.toLowerCase())
      )
    : [];


  useEffect(() => {
    // Only reset form data if searchQuery is empty and we had previous class data
    if (formData.classCode && searchQuery !== formData.classCode) {
      setFormData(prevData => ({
        ...prevData,
        className: "",
        classCode: "",
        term: "",
      }));
    }
  }, [searchQuery, formData.classCode]);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const studyGroupData = {
      groupName: formData.groupName,
      className: formData.className,
      classCode: formData.classCode,
      professor: formData.professor,
      term: formData.term,
      description: formData.description,
      meetingDay: formData.meetingDay,
      meetingTime: formData.meetingTime,
      location: formData.location,
      groupCreatorContact: formData.groupCreatorContact,
    };
    console.log("Study Group Data:", studyGroupData);
  }

  const daysOfWeek = [
    { value: "Monday", label: "Monday" },
    { value: "Tuesday", label: "Tuesday" },
    { value: "Wednesday", label: "Wednesday" },
    { value: "Thursday", label: "Thursday" }, 
    { value: "Friday", label: "Friday" },
    { value: "Saturday", label: "Saturday" },
    { value: "Sunday", label: "Sunday" },
  ];

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center gap-6 px-6 py-8 max-w-md mx-auto">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight dark:text-gray-50">
            Create a New Study Group with <SwampStudy />
          </h1>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p>
              Create a study group for your class and connect with other students!
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
            <label htmlFor="groupName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Group Name
            </label>
            <FormInput
              type="text"
              id="groupName"
              name="groupName"
              placeholder="Name your group"
              value={formData.groupName}
              onChange={handleInputChange}
              minLength={2}
              required
            />
            <label htmlFor="classCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Class Code
            </label>
            <FormInput
              type="text"
              id="classCode"
              name="classCode"
              placeholder="e.g. MAC2313"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              minLength={2}
              required
            />

            {/* Show loading state when searching */}
            {searchQuery.length === 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
              Start typing to search for a class...
              </div>
            )}

            {/* Show search results when classes are found */}
            {selectedClass.length > 0 && (
              <>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedClass.length} class(es) found matching your search.
              </div>

              <div className="space-y-2">
                {selectedClass.map(cls => (
                <div
                  key={cls.id}
                  className="p-4 border rounded-lg shadow-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={() => {
                  setFormData(prevData => ({
                    ...prevData,
                    className: cls.className,
                    classCode: cls.classCode,
                    term: cls.term,
                  }));
                  setSearchQuery(cls.classCode);
                  }}
                  onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setFormData(prevData => ({
                    ...prevData,
                    className: cls.className,
                    classCode: cls.classCode,
                    term: cls.term,
                    }));
                    setSearchQuery(cls.classCode);
                  }
                  }}
                  tabIndex={0}
                  role="button"
                >
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  {cls.className}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                  Class code: {cls.classCode}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                  Description: {cls.classDescription}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                  Professor: {cls.professor}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                  Term: {cls.term}
                  </p>
                </div>
                ))}
              </div>
              </>
            )}

            {/* Show "no results" when searching but no classes found */}
            {searchQuery.length > 0 && selectedClass.length === 0 && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
              No classes found matching your search.{' '}
              <Link to="/new-class" className="text-blue-600 dark:text-blue-400 hover:underline">
                Create a new class here
              </Link>
              </div>
            )}

            <label htmlFor="term" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Term
            </label>
            <TermDropdown
              id="term"
              name="term"
              value={formData.term}
              onChange={handleInputChange}
            />

            <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Write a short description of your group"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              minLength={15}
              maxLength={200}
              className="w-full px-3 py-2 border rounded-md"
            />

            <label htmlFor="meetingDay" className="text-sm font-medium text-gray-700 dark:text-gray-300">
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
            {/* <FormInput
              type="date"
              id="meetingDay"
              name="meetingDay"
              value={formData.meetingDay}
              onChange={handleInputChange}
              required
            /> */}

            <label htmlFor="meetingTime" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Meeting Time
            </label>
            <FormInput
              type="time"
              id="meetingTime"
              name="meetingTime"
              value={formData.meetingTime}
              onChange={handleInputChange}
            />

            <label htmlFor="location" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Location
            </label>
            <FormInput
              type="text"
              id="location"
              name="location"
              placeholder="e.g. Martson Basement, Library West, etc." //FIXME Consider a dropdown for this
              value={formData.location}
              onChange={handleInputChange}
              minLength={5} 
            />

            <label htmlFor="groupCreatorContact" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Contact Information
            </label>
            <FormInput
              type="text"
              id="groupCreatorContact"
              name="groupCreatorContact"
              placeholder="How should we notify you?"
              value={formData.groupCreatorContact}
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
