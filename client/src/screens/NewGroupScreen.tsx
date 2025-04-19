import React, { useState, } from "react";
import { NavigateFunction, useNavigate } from "react-router";
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

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const studyGroupData = {
      courseName: formData.courseName,
      courseCode: formData.courseCode,
      term: formData.term,
      description: formData.description,
      meetingDate: formData.meetingDate,
      meetingTime: formData.meetingTime,
      location: formData.location,
      maxMembers: Number(formData.maxMembers),
    };
    console.log("Study Group Data:", studyGroupData);
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

        {error && (
          <div className="w-full p-3 rounded-lg bg-red-50 dark:bg-red-900/30
                          text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

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
              value={formData.courseName}
              onChange={handleInputChange}
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
              placeholder="e.g. MAC2313"
              value={formData.courseCode}
              onChange={handleInputChange}
              minLength={2}
              required
            />

            <label htmlFor="term" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Term
            </label>
            <select
              id="term"
              name="term"
              value={formData.term}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              rows={3}
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
              value={formData.meetingDate}
              onChange={handleInputChange}
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

            <label htmlFor="maxMembers" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Max Number of Members (4-6)
            </label>
            <FormInput
              type="number"
              id="maxMembers"
              name="maxMembers"
              value={formData.maxMembers}
              onChange={handleInputChange}
              min={4}
              max={6}
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
