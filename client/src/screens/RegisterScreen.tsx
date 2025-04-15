import { FormEvent, useState } from "react";
import { validateEmailDomain } from "../util/validate";
import { Link, useNavigate } from "react-router";
import { attemptLogin } from "./LoginScreen";
import Button from "../components/Button";
import FormInput from "../components/FormInput";
import SwampStudy from "../components/SwampStudy";

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
            <FormInput
              type="text"
              id="firstName"
              name="firstName"
              placeholder="First name"
              value={formData.firstName}
              onChange={handleInputChange}
              minLength={2}
              required
            />

            <FormInput
              type="text"
              id="lastName"
              name="lastName"
              placeholder="Last name"
              value={formData.lastName}
              onChange={handleInputChange}
              minLength={2}
              required
            />
          </div>

          <FormInput
            type="number"
            id="gradYear"
            name="gradYear"
            placeholder="Grad year"
            value={formData.gradYear}
            onChange={handleInputChange}
            min={2025}
            max={2029}
            required
          />

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
          Join
        </Button>

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
