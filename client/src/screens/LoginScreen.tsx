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
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Login</h1>
      <p>Enter your UF email and password to login</p>
      {error && <p style={{ "color": "red" }}>{error}</p>}
      <form
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        onSubmit={handleSubmit}
      >
        <label>
          <input
            style={{ width: "175px" }}
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
        <br/>
        <label style={{ paddingLeft: "20px" }}>
          <input
            style={{ width: "175px" }}
            type={passwordVisible ? "text" : "password"}
            id="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            minLength={5}
            onChange={handleInputChange}
            required
          />
        <img
          src={passwordVisible ? viewIcon : hideIcon}
          onClick={() => setPasswordVisible(prev => !prev)}
          alt={passwordVisible ? "Hide Password" : "View Password"}
          style={{
            cursor: "pointer",
            width: "20px",
            height: "20px",
            position: "relative",
            top: "5px",
            left: "-25px"
          }}
        />
        </label>
        <br/>
        <button type="submit" style={{ backgroundColor: "#C2D5C8", color: "black", padding: "10px 20px", marginTop: "10px", borderRadius: "10px", cursor: "pointer", boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)" }}>
          {isLoading ? "Loading..." : "Log In"}
        </button>
        <br/>
        <Link to="/register" style={{ color: "black" }}>
          New here? Sign up here!
        </Link>
      </form>
    </div>
  );
}

