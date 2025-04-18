import React, { useState, } from "react";
import NavBar from "../components/NavBar";
import SwampStudy from "../components/SwampStudy";
import FormInput from "../components/FormInput";
import Button from "../components/Button";

type StudyGroupFormData = {
  courseName: string;
  courseCode: string;
  term: string;
  description: string;
  meetingDate: string;
  meetingTime: string;
  location: string;
  maxMembers: number;
}

export default function NewGroupScreen() {
  // Redirect to login screen when signed out
  const [formData, setFormData] = useState<StudyGroupFormData>({
    courseName: "",
    courseCode: "",
    term: "",
    description: "",
    meetingDate: "",
    meetingTime: "",
    location: "",
    maxMembers: 0,
  });

  const [error, setError] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const studyGroupData = {
      course_name: formData.courseName,
      course_code: formData.courseCode,
      term: formData.term,
      description: formData.description,
      meeting_date: formData.meetingDate,
      meeting_time: formData.meetingTime,
      location: formData.location,
      max_members: formData.maxMembers,
    };
    console.log("Study Group Data:", studyGroupData);
    // More to add here
  }

  const terms = [
    { value: '', label: 'Select a term' },
    { value: 'Spring 2025', label: 'Spring 2025' },
    { value: 'Summer 2025', label: 'Summer 2025' },
    { value: 'Fall 2025', label: 'Fall 2025' }
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
              Create a study group for your course and connect with other students!
            </p>
            <p>Fill out the below fields</p>
          </div>
        </div>

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <label htmlFor="courseName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Course Name
            </label>
            <FormInput
              type="text"
              id="courseName"
              name="courseName"
              placeholder="e.g. Calculus 3"
              value={formData.courseCode}
              onChange={handleInputChange} //FIXME write handleInputChange function
              minLength={2}
              required
            />

            <label htmlFor="courseCode" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Course Code
            </label>
            <FormInput
              type="text"
              id="courseCode"
              name="courseCode"
              placeholder="e.g. MAC 2313"
              value={formData.courseCode}
              onChange={handleInputChange} //FIXME write handleInputChange function
              minLength={2}
              required
            />

            <label htmlFor="courseTerm" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Term
            </label>
            <select
              id="term"
              name="term"
              value={formData.term}
              //onChange={handleInputChange} //FIXME write handleInputChange function
              className={'w-full px-3 py-2 border rounded-md'}
            >
              {terms.map((term) => (
              <option key={term.value} value={term.value}>
                {term.label}
              </option>
              ))}
            </select>

            <label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Write a short description of your group"
              value={formData.description}
              rows={4}
              minLength={15}
              maxLength={200}
              className="w-full px-3 py-2 border rounded-md"
            />

            <label htmlFor="meetingDate" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Meeting Date
            </label>
            <FormInput
              type="date"
              id="meetingDate"
              name="meetingDate"
              value={formData.courseCode}
              onChange={handleInputChange} //FIXME write handleInputChange function
              required
            />

            <label htmlFor="meetingTime" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Meeting Time
            </label>
            <FormInput
              type="time"
              id="meetingTime"
              name="meetingTime"
              value={formData.meetingTime}
              onChange={handleInputChange} //FIXME write handleInputChange function
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
              onChange={handleInputChange} //FIXME write handleInputChange function
              minLength={5} 
            />
          </div>
        </form>
        
        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          Create
        </Button>
      </div>
    </>
  );
}
