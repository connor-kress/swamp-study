import LogoutButton from "../components/LogoutButton";
import SwampStudy from "../components/SwampStudy";
import { Link } from "react-router";

export default function DashboardScreen() {
  // Redirect to login screen when signed out
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1><SwampStudy /> Dashboard</h1>
      <LogoutButton />
      <Link to="/new-group">
        <button style={{ margin: '20px 10px', padding: '10px 20px' }}>
          Create a Group
        </button>
      </Link>

      <Link to="/find-group">
        <button style={{ margin: '20px 10px', padding: '10px 20px' }}>
          Join a Group
        </button>
      </Link>
    </div>
  );
}
