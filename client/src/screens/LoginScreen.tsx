import React, { FormEvent, useEffect, useState } from "react";
import { validateEmailDomain } from "../util/validate";
import { Link, NavigateFunction, useNavigate } from "react-router";
import { useAuthFetch } from "../hooks/useAuthFetch";
import Button from "../components/Button";
import FormInput from "../components/FormInput";

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
          <FormInput
            type="email"
            id="email"
            name="email"
            placeholder="UF email"
            value={formData.email}
            onChange={handleInputChange}
            minLength={10}
            onBlur={validateEmailDomain}
            onInput={validateEmailDomain}
            required
          />

          <FormInput
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            minLength={5}
            required
            passwordToggle
            passwordVisible={passwordVisible}
            onPasswordToggle={() => setPasswordVisible(prev => !prev)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isLoading={isLoading}
          disabled={isLoading}
        >
          Log In
        </Button>

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
