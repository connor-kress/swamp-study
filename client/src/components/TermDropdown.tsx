import React from "react";
import { CourseTerm } from "../types";

export const courseTermData: {
  value: string;
  term: CourseTerm;
  year: number;
}[] = [
  { value: "Spring 2025", term: "spring", year: 2025 },
  { value: "Summer A 2025", term: "summer-a", year: 2025 },
  { value: "Summer B 2025", term: "summer-b", year: 2025 },
  { value: "Summer C 2025", term: "summer-c", year: 2025 },
  { value: "Fall 2025", term: "fall", year: 2025 },
];

interface TermDropdownProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function TermDropdown({
    id,
    name,
    value,
    onChange,
}: TermDropdownProps) {
  return (
    <select
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        className= "w-full px-3 py-2 border rounded-md"
    >
      {courseTermData.map((term) => (
        <option key={term.value} value={term.value}>
          {term.value}
        </option>
      ))}
    </select>
  );
}
