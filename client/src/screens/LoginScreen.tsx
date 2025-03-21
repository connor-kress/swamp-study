import { FormEvent, useState } from "react";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";
import { validateEmailDomain } from "../util/validate";
import { Link } from "react-router";

type LoginFormData = {
  email: string;
  password: string;
};

export default function LoginScreen() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: ""
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!formData.email.endsWith("@ufl.edu")) {
      console.error("Invalid UF email (must end with @ufl.edu)");
      return;
    }
    console.log(`Email: ${formData.email}, Password: ${formData.password}`);
    // TODO: Integrate with backend
  }


  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Login</h1>
      <p>Enter your UF email and password to login</p>
      <form
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        onSubmit={handleSubmit}
      >
        <label style={{ textAlign: "center" }}>
          <input
            style= {{ alignItems: "center" }}
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
        <label style={{ textAlign: "center", paddingLeft: "20px" }}>
          <input
            style= {{ alignItems: "center" }}
            type={passwordVisible ? "text" : "password"}
            id="password"
            name="password"
            placeholder="password"
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

