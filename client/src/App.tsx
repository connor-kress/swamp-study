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
  return <div></div>;
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
