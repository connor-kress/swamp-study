import React, { useState } from "react";
import { NavigateFunction, useNavigate } from "react-router";

import Button from "../components/Button";
import FormInput from "../components/FormInput";
import NavBar from "../components/NavBar";
import SwampStudy from "../components/SwampStudy";
import { useAuthFetch } from "../hooks/useAuthFetch";

type ClassData = {
  name: string;
  code: string;
  description: string;
  professor: string;
};

async function attemptAddClass(
  classData: ClassData,
  authFetch: ReturnType<typeof useAuthFetch>,
  navigate: NavigateFunction,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
): Promise<void> {
  setError("");
  setIsLoading(true);
  try {
    const response = await authFetch("/api/course", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(classData),
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
    console.log("Class added successfully:", data);
    navigate("/new-group");
  } catch (err) {
    console.error("Error adding class:", err);
    setError(err instanceof Error ? err.message : "Adding class failed");
  } finally {
    setIsLoading(false);
  }
}

export default function NewClassScreen() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ClassData>({
    name: "",
    code: "",
    description: "",
    professor: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement
                                          | HTMLSelectElement>
  ) {
    let { name, value } = e.target;
    if (name == "code") {
      value = value.replace(" ", "").toUpperCase();
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    const classData: ClassData = {
      name: formData.name.trim(),
      code: formData.code.trim(),
      description: formData.description.trim(),
      professor: formData.professor.trim(),
    };
    console.log(classData);
    await attemptAddClass(
      classData, authFetch, navigate, setError, setIsLoading
    );
  }

  return (
    <>
      <NavBar />
      <div className="flex flex-col items-center gap-6 px-6 py-8
                      max-w-md mx-auto">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold tracking-tight dark:text-gray-50">
            Don't see your class?<br />
            Add it to <SwampStudy />!
          </h1>
          <div className="space-y-2 text-gray-600 dark:text-gray-400">
            <p>Fill in the information below to add a class</p>
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
              Course Title
            </label>
            <FormInput
              type="text"
              id="name"
              name="name"
              placeholder="Enter the course title"
              value={formData.name}
              onChange={handleInputChange}
              minLength={5}
              maxLength={100}
              required
            />

            <label
              htmlFor="code"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Course Code
            </label>
            <FormInput
              type="text"
              id="code"
              name="code"
              placeholder="e.g. COP3530"
              value={formData.code}
              onChange={handleInputChange}
              minLength={7}
              maxLength={10}
              required
            />

            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Course Description
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Enter the course description from one.uf.edu"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              minLength={15}
              maxLength={200}
              className="w-full px-3 py-2 border rounded-md"
              required
            />

            <label
              htmlFor="professor"
              className="text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Professor
            </label>
            <FormInput
              type="text"
              id="professor"
              name="professor"
              placeholder="e.g. Amanpreet Kapoor"
              value={formData.professor}
              onChange={handleInputChange}
              minLength={3}
              maxLength={100}
              required
            />

          </div>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
          >
            Add Class
          </Button>
        </form>
      </div>
    </>
  );
}
