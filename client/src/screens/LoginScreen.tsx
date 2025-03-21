import { FormEvent, useEffect, useState } from "react";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";
import { validateEmailDomain } from "../util/validate";
import { Link, useNavigate } from "react-router";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      email: formData.email,
      password: formData.password,
    });
    console.log(`Email: ${formData.email}, Password: ${formData.password}`);
    try {
      const response = await fetch(`/api/auth/login?${params.toString()}`,
        { method: "POST" },
      );

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json?.error || "Unknown");
      }

      const data = await response.json();
      if (data.error) throw data.error;
      console.log("Login successful:", data);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error logging in:", error);
      throw error;
    }
  }

  async function verifySession() {
    try {
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        console.log("No valid session found.");
        // TODO: try refresh token
        return;
      }

      const data = await response.json();
      console.log("Session verified:", data.user);
      navigate("/dashboard");
    } catch (error) {
      console.error("Error verifying session:", error);
    }
  }

  useEffect(() => {
    verifySession();
  }, [navigate]);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Login</h1>
      <p>Enter your UF email and password to login</p>
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
        <Link to="/register" style={{ color: "black" }}>
          New here? Sign up here!
        </Link>
        <br/>
        <button type="submit" style={{ backgroundColor: "#C2D5C8", color: "black", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)" }}>
          Log In
        </button>
      </form>
    </div>
  );
}

