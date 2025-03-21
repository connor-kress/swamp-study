import { BrowserRouter as Router, Routes, Route, Link } from 'react-router'
import { FormEvent, useState } from 'react';
import viewIcon from './assets/view.png';
import hideIcon from './assets/hide.png';

// The SwampStudy logo text
function SwampStudy() {
  return (
    <span>
      <span style={{color: '#0021A5', fontWeight: 'bold'}}>Swamp</span>
      <span style={{color: '#FA4616', fontWeight: 'bold'}}>Study</span>
    </span>
  );
}

function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome to <SwampStudy /></h1>
      <p>Your ultimate study companion for academic success</p>
      <div style={{ marginTop: '30px' }}>
        <Link to="/login">
          <button style={{ margin: '0 10px', padding: '10px 20px' }}>
            Login
          </button>
        </Link>
        <Link to="/register">
          <button style={{ margin: '0 10px', padding: '10px 20px' }}>
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
}

function validateEmailDomain(e: React.FormEvent<HTMLInputElement>) {
    const target = e.currentTarget;
    const email = target.value;
    // Only set the error if the field is not empty
    if (email && !email.endsWith("@ufl.edu")) {
      target.setCustomValidity(
        "UF email required."
      );
    } else {
      target.setCustomValidity("");
    }
}

type LoginFormData = {
  email: string;
  password: string;
};

function LoginScreen() {
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
  <div style={{ textAlign: 'center', marginTop: '100px' }}>
    <h1>Login</h1>
    <p>Enter your UF email and password to login</p>
    <form
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
      onSubmit={handleSubmit}
    >
      <label style={{ textAlign: 'center' }}>
        <input
          style= {{ alignItems: 'center' }}
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
      <label style={{ textAlign: 'center', paddingLeft: '20px' }}>
        <input
          style= {{ alignItems: 'center' }}
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
          cursor: 'pointer',
          width: '20px',
          height: '20px',
          position: 'relative',
          top: '5px',
          left: '-25px'
        }}
      />
      </label>
      <br/>
      <Link to="/register" style={{ color: 'black' }}>
        New here? Sign up here!
      </Link>
      <br/>
      <button type="submit" style={{ backgroundColor: '#C2D5C8', color: 'black', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)' }}>
        Log In
      </button>
    </form>
  </div>
);
}

type RegisterFormData = {
    firstName: string;
    lastName: string;
    gradYear: string;
    email: string;
    password: string;
};

function RegisterScreen() {
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
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome to our Swamp!</h1>
      <p>
        Find your classmates, friends, and new study buddies by joining
        us at <SwampStudy />
      </p>
      <p>Fill out the below fields to get started!</p>
      <form
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
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
            style={{ width: '175px' }}
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
        <label style={{ textAlign: 'center' }}>
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
        <label style={{ textAlign: 'center', paddingLeft: '20px' }}>
          <input
              style= {{ alignItems: 'center' }}
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
              cursor: 'pointer',
              width: '20px',
              height: '20px',
              position: 'relative',
              top: '5px',
              left: '-25px'
            }}
          />
        </label>
        <br/>
        <Link to="/login" style={{ color: 'black' }}>
          Already have an account? Login here!
        </Link>
        <br/>
        <button type="submit" style={{ backgroundColor: '#C2D5C8', color: 'black', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)' }}>
          Join
        </button>
      </form>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
      </Routes>
    </Router>
  );
}
