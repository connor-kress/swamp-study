import { Link } from "react-router";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  type?: "button" | "submit" | "reset";
  to?: string;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  className?: string;
}

export default function Button({
  children,
  variant = "primary",
  type = "button",
  to,
  onClick,
  disabled = false,
  fullWidth = false,
  isLoading = false,
  className = "",
}: ButtonProps) {
  // Base (layout) styles: sizing, spacing, layout, focus, etc.
  const baseStyles = `
    ${fullWidth ? "w-full" : "w-auto"}
    inline-flex items-center justify-center
    px-8 py-3 rounded-lg
    focus:outline-none focus:ring-2
    focus:ring-offset-2 dark:focus:ring-offset-gray-800
    disabled:opacity-60 disabled:cursor-not-allowed
    transition-all cursor-pointer
  `;
  // Variant styles for background, border, hover, and focus.
  const variantBgStyles = {
    primary: `
      bg-blue-600 dark:bg-blue-500 
      hover:bg-blue-700 dark:hover:bg-blue-600 
      focus:ring-blue-500 dark:focus:ring-blue-400
    `,
    secondary: `
      bg-white dark:bg-gray-800 
      border border-gray-300 dark:border-gray-600 
      hover:bg-gray-50 dark:hover:bg-gray-700 
      focus:ring-blue-500 dark:focus:ring-blue-400
    `,
  };
  // Variant styles for text color.
  const variantTextStyles = {
    primary: `text-white`,
    secondary: `text-gray-900 dark:text-gray-100`,
  };

  // The content: if loading, show a spinner; otherwise, show the children.
  const content = isLoading ? (
    <span className="flex items-center gap-2">
      <svg
        className="animate-spin h-5 w-5"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 
             7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      Loading...
    </span>
  ) : (
    children
  );

  // If "to" is provided, render a Link.
  if (to) {
    return (
      <Link
        to={to}
        onClick={onClick}
        // Apply the layout and background styles on the Link.
        // (No text styling here.)
        className={`
          group block ${fullWidth ? "w-full" : "w-auto"}
          ${baseStyles}
          ${variantBgStyles[variant]} ${className}
        `}
      >
        {/* Apply text-specific styles on the inner span */}
        <span className={`inline-block font-medium ${variantTextStyles[variant]}`}>
          {content}
        </span>
      </Link>
    );
  }

  // Otherwise, render a native <button> with all styles concatenated.
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`
        ${baseStyles}
        ${variantBgStyles[variant]} ${variantTextStyles[variant]} ${className}
      `}
    >
      {content}
    </button>
  );
}
