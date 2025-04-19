import React from "react";

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
    console.log(`TermDropdown ${name} props:`, {name, id, value}); // Add this line
    const terms = [
        { value: '', label: 'Select a term' },
        { value: 'Spring 2025', label: 'Spring 2025' },
        { value: 'Summer 2025', label: 'Summer 2025' },
        { value: 'Fall 2025', label: 'Fall 2025' }
    ];
    const baseDropdownStyles = 'w-full px-3 py-2 border rounded-md';
    
    return (
        <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            className={baseDropdownStyles}
        >
              {terms.map((term) => (
              <option key={term.value} value={term.value}>
                {term.label}
              </option>
              ))}
        </select>
    );
}