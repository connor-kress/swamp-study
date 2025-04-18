import { useState } from "react";
import { Link } from "react-router";
import NavBar from "../components/NavBar";
import SwampStudy from "../components/SwampStudy";
import FormInput from "../components/FormInput";
import Button from "../components/Button";

// Mock data for demonstration - in proudction use real data from the databse
// also include token verification for when user is not logged in

const mockGroups = [
  { 
    id: 1, 
    className: "Introduction to Computer Science", 
    classCode: "COP3502", 
    professor: "Dr. Amanpreet Kapoor (GOAT)",
    location: "Marston Science Library, Room 203",
    startTime: "2:00 PM",
    endTime: "4:00 PM"
  },
  { 
    id: 2, 
    className: "Data Structures and Algorithms", 
    classCode: "COP3530", 
    professor: "Dr. Amanpreet Kapoor (GOAT)",
    location: "Newell Hall, Room 101",
    startTime: "3:30 PM",
    endTime: "5:30 PM"
  },
  { 
    id: 3, 
    className: "Computer Organization", 
    classCode: "CDA3101", 
    professor: "Dr. Cheryl Resch (ANOTHER GOAT)",
    location: "Library West, Room 302",
    startTime: "1:00 PM",
    endTime: "3:00 PM"
  },
];

export default function GroupSearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter groups based on search query
  const filteredGroups = mockGroups.filter(group => 
    group.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.classCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {filteredGroups.length > 0 ? (
          <div className="space-y-4">
            {filteredGroups.map(group => (
              <div 
                key={group.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <h3 className="text-xl font-semibold">{group.className}</h3>
                <div className="mt-2 space-y-1">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Code:</span> {group.classCode}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Professor:</span> {group.professor}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Location:</span> {group.location}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Time:</span> {group.startTime} - {group.endTime}
                  </p>
                </div>
                <div className="mt-4">
                  <Button variant="primary">
                    Join Group
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>No groups found matching your search.</p>
            <p className="mt-4">
              Can't find a group? <Link to="/new-group" className="text-blue-600 dark:text-blue-400 hover:underline">Create a new one</Link>.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
