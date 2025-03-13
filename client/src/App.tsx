import { BrowserRouter as Router, Routes, Route, Link } from 'react-router'

function Home() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>Welcome to SwampStudy</h1>
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
  return (
  <div style={{ textAlign: 'center', marginTop: '100px' }}>
    <h1>Login</h1>
    <p>Enter your UFL email and password to login</p>
    <form style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <label style={{ textAlign: 'center' }}>
        <input type="text" name="email" placeholder='Enter your UFL email...' />
      </label>
      <br />
      <label style={{ textAlign: 'center' }}>
        <input type="password" name="password" placeholder='Enter your password' />
      </label>
      <br />
      <Link to="/signup" style={{ color: 'black' }}>New here? Sign up here!</Link>
      <br />
      <button type="submit" style={{ backgroundColor: '#C2D5C8', color: 'black', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.3)' }}>
        Join
      </button>
    </form>
  </div>
);
};

// Signup Page (Placeholder)
function Signup () {
  return <div></div>;
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
