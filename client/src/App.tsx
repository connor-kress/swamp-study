import { BrowserRouter as Router, Routes, Route, Link } from 'react-router'
import { useState } from 'react';
import viewIcon from './assets/view.png';
import hideIcon from './assets/hide.png';


function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome to <span style={{color: '#0021A5', fontWeight: 'bold'}}>Swamp</span><span style={{color: '#FA4616', fontWeight: 'bold'}}>Study</span></h1>
      <p>Your ultimate study companion for academic success</p>
      <div style={{ marginTop: '30px' }}>
        <Link to="/login">
          <button style={{ margin: '0 10px', padding: '10px 20px' }}>
            Login
          </button>
        </Link>
        <Link to="/signup">
          <button style={{ margin: '0 10px', padding: '10px 20px' }}>
            Sign Up
          </button>
        </Link>
      </div>
    </div>
  );
};

// Login Page (Placeholder)
function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = { 
      email: (e.target as HTMLFormElement).email.value,
      password: (e.target as HTMLFormElement).password.value
      };
    console.log(data);

    setEmail(data.email);
    setPassword(data.password);

    console.log(`Email: ${email}, Password: ${password}`); //FIXME email and password are captured, send to backend (later)
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
  <div style={{ textAlign: 'center', marginTop: '100px' }}>
    <h1>Login</h1>
    <p>Enter your UFL email and password to login</p>
    <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} onSubmit={handleLogin}>
      <label style={{ textAlign: 'center' }}>
        <input 
          type="text" 
          id="email" 
          name="email" 
          placeholder='Enter your UFL email'
          style= {{ alignItems: 'center' }}
        />
      </label>
      <br />
      <label style={{ textAlign: 'center', paddingLeft: '20px' }}>
        <input 
          type={passwordVisible ? "text" : "password"} 
          id="password" name="password" 
          placeholder='Enter your password'
          style= {{ alignItems: 'center' }}
        />
      <img 
        src={passwordVisible ? viewIcon : hideIcon} 
        onClick={togglePasswordVisibility} 
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
      <br />
      <Link to="/signup" style={{ color: 'black' }}>New here? Sign up here!</Link>
      <br />
      <button type="submit" style={{ backgroundColor: '#C2D5C8', color: 'black', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)' }}>
        Log In
      </button>
    </form>
  </div>
);
};

// Signup Page (Placeholder)
function Signup () {
  const [name, setName] = useState('');
  const [gradYear, setGradYear] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);


  const handleSignUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      firstName: (e.target as HTMLFormElement).firstName.value,
      lastName: (e.target as HTMLFormElement).lastName.value,
      gradYear: (e.target as HTMLFormElement).gradYear.value,
      email: (e.target as HTMLFormElement).email.value,
      password: (e.target as HTMLFormElement).password.value
      };
    console.log(data);

    setName(data.firstName + ' ' + data.lastName);
    setGradYear(data.gradYear);
    setEmail(data.email);
    setPassword(data.password);

    console.log(`Name: ${name}, Grad Year: ${gradYear}, Email: ${email}, Password: ${password}`); //FIXME name, grad year, email, and password are captured, send to backend (later)
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  return (
    <>
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
    <h1>Welcome to our Swamp!</h1>
    <p>Find your classmates, friends, and new study buddies by joining us at <span style={{color: '#0021A5', fontWeight: 'bold'}}>Swamp</span><span style={{color: '#FA4616', fontWeight: 'bold'}}>Study</span></p>
    <p>Fill out the below fields to get started!</p>
    <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} onSubmit={handleSignUp}>
      <label>
        <input 
          type="text" 
          id="firstName" 
          name="firstName" 
          placeholder='First Name' 
        />
      </label>
      <label>
        <input 
          type="text" 
          id="lastName" 
          name="lastName" 
          placeholder='Last Name' 
        />
      </label>
      <label>
        <input 
          type="number" 
          id="gradYear" 
          name="gradYear" 
          placeholder='Graduation Year' 
        />
      </label>
      <label style={{ textAlign: 'center' }}>
        <input 
          type="text" 
          id="email" 
          name="email" 
          placeholder='UFL Email'
        />
      </label>
      <label style={{ textAlign: 'center', paddingLeft: '20px' }}>
        <input 
            type={passwordVisible ? "text" : "password"} 
            id="password" name="password" 
            placeholder='Create a password'
            style= {{ alignItems: 'center' }}
          />
        <img 
          src={passwordVisible ? viewIcon : hideIcon} 
          onClick={togglePasswordVisibility} 
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
      <br />
      <Link to="/signup" style={{ color: 'black' }}>New here? Sign up here!</Link>
      <br />
      <button type="submit" style={{ backgroundColor: '#C2D5C8', color: 'black', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)' }}>
        Join
      </button>
    </form>
  </div>
  </>
);
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}
