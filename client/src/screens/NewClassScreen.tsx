import React from "react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import SwampStudy from "../components/SwampStudy";
import TermDropdown from "../components/TermDropdown";

type classData = {
    id: number;
    className: string;
    classCode: string;
    classDescription: string;
    professor: string;
    term: string;
};

export default function NewClassScreen() {
    const [formData, setFormData] = useState<classData>({
        id: 0,
        className: "",
        classCode: "",
        classDescription: "",
        professor: "",
        term: "",
        });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;   
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        const newClassData = {
            className: formData.className,
            classCode: formData.classCode,
            classDescription: formData.classDescription,
            professor: formData.professor,
            term: formData.term,
        };
        console.log(newClassData);
    }
    
    return (
        <>
          <NavBar />
          <div className="flex flex-col items-center gap-6 px-6 py-8 max-w-md mx-auto">
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-bold tracking-tight dark:text-gray-50">
                Don't see your class?
                <br /> Add it to <SwampStudy />!
              </h1>
              <div className="space-y-2 text-gray-600 dark:text-gray-400">
                <p>
                  Fill in the information below to add a class
                </p>
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
                <label htmlFor="className" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class Name
                </label>
                <FormInput
                  type="text"
                  id="className"
                  name="className"
                  placeholder="Enter the course name"
                  value={formData.className}
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
                  placeholder="Enter the course code"
                  value={formData.classCode}
                  onChange={handleInputChange}
                  minLength={2}
                  required
                />
    
                <label htmlFor="classDescription" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class Description
                </label>
                <textarea
                  id="classDescription"
                  name="classDescription"
                  placeholder="Enter the course description from one.uf.edu"
                  value={formData.classDescription}
                  onChange={handleInputChange}
                  rows={3}
                  minLength={15}
                  maxLength={200}
                  className="w-full px-3 py-2 border rounded-md"
                />
    
                <label htmlFor="professor" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Professor
                </label>
                <FormInput
                  type="text"
                  id="location"
                  name="location"
                  placeholder="Enter your professor's last name"
                  value={formData.professor}
                  onChange={handleInputChange}
                  minLength={2} 
                />
    
                <label htmlFor="term" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Term
                </label>
                <TermDropdown
                    id="term"
                    name="term"
                    value={formData.term}
                    onChange={handleInputChange}
                />
              </div>
              <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isLoading}
              disabled={isLoading}
              >
                Add to SwampStudy
              </Button>
            </form>
          </div>
        </>
      );
    
}