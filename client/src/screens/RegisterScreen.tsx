import { FormEvent, useState } from "react";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";
import SwampStudy from "../components/SwampStudy";
import { validateEmailDomain } from "../util/validate";
import { Link, useNavigate } from "react-router";
import { attemptLogin } from "./LoginScreen";

export default function RegisterScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    gradYear: "",
    email: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    const payload = {
      name: `${formData.firstName} ${formData.lastName}`,
      grad_year: Number(formData.gradYear),  // will not be invalid
      email: formData.email,
      password: formData.password,
    };
    console.log("Payload:", payload);
    try {
      const response = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json?.error || "Unknown error");
      }

      const data = await response.json();
      console.log("User registered successfully:", data);
      // navigate("/login");
    } catch (err) {
      console.error("Error registering user:", err);
      setError(err instanceof Error ? err.message : "Login failed");
      return;
    } finally {
      setIsLoading(false);
    }
    const credentials = {
      email: formData.email,
      password: formData.password,
    };
    console.log("Login credentials:", credentials);
    attemptLogin(credentials, navigate, setError, setIsLoading);
  }

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-8 max-w-md mx-auto">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight dark:text-gray-50">
          Welcome to our Swamp!
        </h1>
        <div className="space-y-2 text-gray-600 dark:text-gray-400">
          <p>
            Find your classmates, friends, and new study buddies by joining us at{" "}
            <SwampStudy />
          </p>
          <p>Fill out the below fields to get started!</p>
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
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <input
                className="w-full px-4 py-2.5 rounded-lg
                           border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-500 dark:placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent dark:focus:ring-blue-400
                           transition"
                type="text"
                id="firstName"
                name="firstName"
                placeholder="First name"
                value={formData.firstName}
                minLength={2}
                onChange={handleInputChange}
                required
              />
            </label>

            <label className="block">
              <input
                className="w-full px-4 py-2.5 rounded-lg
                           border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-500 dark:placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent dark:focus:ring-blue-400
                           transition"
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Last name"
                value={formData.lastName}
                minLength={2}
                onChange={handleInputChange}
                required
              />
            </label>
          </div>

          <label className="block">
            <input
              className="w-full px-4 py-2.5 rounded-lg
                         border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-800
                         text-gray-900 dark:text-gray-100
                         placeholder:text-gray-500 dark:placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent dark:focus:ring-blue-400
                         transition"
              type="number"
              id="gradYear"
              name="gradYear"
              placeholder="Grad year"
              value={formData.gradYear}
              min={2025}
              max={2029}
              onChange={handleInputChange}
              required
            />
          </label>

          <label className="block">
            <input
              className="w-full px-4 py-2.5 rounded-lg
                         border border-gray-300 dark:border-gray-600
                         bg-white dark:bg-gray-800
                         text-gray-900 dark:text-gray-100
                         placeholder:text-gray-500 dark:placeholder:text-gray-400
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         focus:border-transparent dark:focus:ring-blue-400
                         transition"
              type="text"
              id="email"
              name="email"
              placeholder="UF email"
              value={formData.email}
              minLength={10}
              onChange={handleInputChange}
              onBlur={validateEmailDomain}
              onInput={validateEmailDomain}
              required
            />
          </label>

          <label className="block">
            <div className="relative">
              <input
                className="w-full px-4 py-2.5 rounded-lg
                           border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-500 dark:placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent dark:focus:ring-blue-400
                           transition"
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                minLength={5}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(prev => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2
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
          </label>
        </div>

        <button
          type="submit"
          className="w-full px-4 py-2.5 rounded-lg
                     bg-blue-600 dark:bg-blue-500
                     text-white font-medium
                     hover:bg-blue-700 dark:hover:bg-blue-600
                     focus:outline-none focus:ring-2
                     focus:ring-blue-500 dark:focus:ring-blue-400
                     focus:ring-offset-2 dark:focus:ring-offset-gray-800
                     disabled:opacity-60 disabled:cursor-not-allowed
                     transition"
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Join"}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-blue-600 dark:text-blue-400
                       hover:text-blue-500 dark:hover:text-blue-300
                       transition"
          >
            Login here!
          </Link>
        </p>
      </form>
    </div>
  );
}
