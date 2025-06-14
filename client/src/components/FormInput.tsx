import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";

interface FormInputProps {
  type: "text" | "number" | "password" | "email" | "date" | "time";
  id: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  // Optional props
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  step?: number; // For time input
  required?: boolean;
  disabled?: boolean;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInput?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pattern?: string;
  // For password toggle functionality
  passwordToggle?: boolean;
  passwordVisible?: boolean;
  onPasswordToggle?: () => void;
}

export default function FormInput({
  type,
  id,
  name,
  placeholder,
  value,
  onChange,
  minLength,
  maxLength,
  min,
  max,
  step,
  required = true, // default required
  disabled = false,
  onBlur,
  onInput,
  pattern,
  passwordToggle = false,
  passwordVisible = false,
  onPasswordToggle
}: FormInputProps) {
  const baseInputStyles = `
    w-full px-4 py-2.5 rounded-lg
    border border-gray-300 dark:border-gray-600
    bg-white dark:bg-gray-800
    text-gray-900 dark:text-gray-100
    placeholder:text-gray-500 dark:placeholder:text-gray-400
    focus:outline-none focus:ring-2 focus:ring-blue-500
    focus:border-transparent dark:focus:ring-blue-400
    transition
  `;

  const input = (
    <input
      className={baseInputStyles}
      type={passwordToggle ? (passwordVisible ? "text" : "password") : type}
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      minLength={minLength}
      maxLength={maxLength}
      min={min}
      max={max}
      step={type === "time" ? "900" : step}
      required={required}
      disabled={disabled}
      onBlur={onBlur}
      onInput={onInput}
      pattern={pattern}
    />
  );

  if (passwordToggle) {
    return (
      <div className="relative flex items-center">
        {input}
        <button
          type="button"
          onClick={onPasswordToggle}
          className="absolute right-3 flex items-center justify-center
                     p-1.5 rounded-md
                     hover:bg-gray-100 dark:hover:bg-gray-700
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     dark:focus:ring-blue-400
                     transition"
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
          title={passwordVisible ? "Hide password" : "Show password"}
        >
          <img
            src={passwordVisible ? viewIcon : hideIcon}
            alt=""
            className="w-5 h-5 dark:invert"
          />
        </button>
      </div>
    );
  }

  return input;
}
