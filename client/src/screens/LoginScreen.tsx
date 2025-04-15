import React, { FormEvent, useEffect, useState } from "react";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";
import { validateEmailDomain } from "../util/validate";
import { Link, NavigateFunction, useNavigate } from "react-router";
import { useAuthFetch } from "../hooks/useAuthFetch";

type LoginCredentials = {
  email: string;
  password: string;
};

export async function attemptLogin(
  credentials: LoginCredentials,
  navigate: NavigateFunction,
  setError: React.Dispatch<React.SetStateAction<string>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
) {
    setError("");
    setIsLoading(true);
    try {
      const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        let err = (await response.json())?.error;
        if (typeof err !== "string") {
          console.error(err);  // for debugging
          err = null;
        }
        throw new Error(err || "Unknown error");
      }

      const data = await response.json();
      if (data.error) throw new Error(data.error);
      console.log("Login successful:", data);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error logging in:", err);
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
}

export default function LoginScreen() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
    const credentials = {
      email: formData.email,
      password: formData.password,
    };
    console.log("Login credentials:", credentials);
    attemptLogin(credentials, navigate, setError, setIsLoading);
  }

  async function verifySession() {
    try {
      const response = await authFetch("/api/auth/verify", { method: "GET" });

      if (!response.ok) {
        console.log("No valid session found.");
        // TODO: try refresh token
        return;
      }

      const data = await response.json();
      console.log("Session verified:", data.user);
      navigate("/dashboard");
    } catch (err) {
      console.error("Error verifying session:", err);
    }
  }

  useEffect(() => {
    verifySession();
  }, [navigate]);

  return (
    <div className="flex flex-col items-center gap-6 px-6 py-8 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight dark:text-gray-50">
          Login
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your UF email and password to login
        </p>
      </div>

      {error && (
        <div className="w-full p-3 rounded-lg bg-red-50 dark:bg-red-900/30
                        text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      <form className="w-full space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <label className="block">
            <div className="relative">
              <input
                className="w-full px-4 py-2.5 rounded-lg
                           border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-500
                           dark:placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent
                           dark:focus:ring-blue-400
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
            </div>
          </label>

          <label className="block">
            <div className="relative">
              <input
                className="w-full px-4 py-2.5 rounded-lg
                           border border-gray-300 dark:border-gray-600
                           bg-white dark:bg-gray-800
                           text-gray-900 dark:text-gray-100
                           placeholder:text-gray-500
                           dark:placeholder:text-gray-400
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent
                           dark:focus:ring-blue-400
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
                onClick={() => setPasswordVisible((prev) => !prev)}
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
          {isLoading ? "Loading..." : "Log In"}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          New here?{" "}
          <Link
            to="/register"
            className="font-medium text-blue-600 dark:text-blue-400
                       hover:text-blue-500 dark:hover:text-blue-300
                       transition"
          >
            Sign up here!
          </Link>
        </p>
      </form>
    </div>
  );
}

