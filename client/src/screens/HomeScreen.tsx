import { Link } from "react-router";
import SwampStudy from "../components/SwampStudy";

export default function HomeScreen() {
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

