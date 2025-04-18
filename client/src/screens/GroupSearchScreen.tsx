import { Link } from "react-router";
import NavBar from "../components/NavBar";
import SwampStudy from "../components/SwampStudy";

export default function GroupSearchScreen() {
  // Redirect to login screen when signed out
  // Search bar for groups where you can filter by course/class/professor?
  return (
    <>
      <NavBar />
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
          <h1><SwampStudy /> Join Room</h1>
          <p>Room joining functionality will be implemented here.</p>
          <p>Can't find a group? <Link to="/new-group">Create a new one</Link>.</p>
      </div>
    </>
  );
}
