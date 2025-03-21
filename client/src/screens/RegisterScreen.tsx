import { FormEvent, useState } from "react";
import viewIcon from "../assets/view.png";
import hideIcon from "../assets/hide.png";
import SwampStudy from "../components/SwampStudy";
import { validateEmailDomain } from "../util/validate";
import { Link } from "react-router";

type RegisterFormData = {
    firstName: string;
    lastName: string;
    gradYear: string;
    email: string;
    password: string;
};

export default function RegisterScreen() {
  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    gradYear: "",
    email: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const name = `${formData.firstName} ${formData.lastName}`;
    const gradYear = Number(formData.gradYear); // will not be invalid
    console.log(`Name: ${name}, Grad Year: ${gradYear
                }, Email: ${formData.email}, Password: ${formData.password}`);
    // TODO: Integrate with backend
  }

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to our Swamp!</h1>
      <p>
        Find your classmates, friends, and new study buddies by joining
        us at <SwampStudy />
      </p>
      <p>Fill out the below fields to get started!</p>
      <form
        style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
        onSubmit={handleSubmit}
      >
        <label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="first name"
            value={formData.firstName}
            minLength={2}
            onChange={handleInputChange}
            required
          />
        </label>
        <label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="last name"
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
            placeholder="grad year"
            value={formData.gradYear}
            min={2025}
            max={2029}
            onChange={handleInputChange}
            required
          />
        </label>
        <label style={{ textAlign: "center" }}>
          <input
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
        <Link to="/login" style={{ color: "black" }}>
          Already have an account? Login here!
        </Link>
        <br/>
        <button type="submit" style={{ backgroundColor: "#C2D5C8", color: "black", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", boxShadow: "0px 0px 5px rgba(0, 0, 0, 0.3)" }}>
          Join
        </button>
      </form>
    </div>
  );
}

