import LogoutButton from "../components/LogoutButton";
import SwampStudy from "../components/SwampStudy";
import { Link } from "react-router";

export default function DashboardScreen() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1><SwampStudy /> Dashboard</h1>
       <LogoutButton /> 
      <Link to="/createRoom">
          <button style={{ margin: '20px 10px', padding: '10px 20px' }}>
            Create A Room
          </button>
        </Link>

        <Link to="/joinRoom">
          <button style={{ margin: '20px 10px', padding: '10px 20px' }}>
            Join A Room
          </button>
        </Link>
      
    </div>
  );
}
