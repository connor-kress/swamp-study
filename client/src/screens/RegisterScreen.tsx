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
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to our Swamp!</h1>
      <p>
        Find your classmates, friends, and new study buddies by joining
        us at <SwampStudy />
      </p>
      <p>Fill out the below fields to get started!</p>
      {error && <p style={{ "color": "red" }}>{error}</p>}
      <form
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        onSubmit={handleSubmit}
      >
        <label>
          <input
            style={{ width: "175px" }}
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
        <label>
          <input
            style={{ width: "175px" }}
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
        <label>
          <input
            style={{ width: "175px" }}
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
          {isLoading ? "Loading..." : "Join"}
        </button>
        <br/>
        <Link to="/login" style={{ color: "black" }}>
          Already have an account? Login here!
        </Link>
      </form>
    </div>
  );
}
