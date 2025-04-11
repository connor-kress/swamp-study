import { Link } from "react-router";

export default function GroupSearchScreen() {
  // Redirect to login screen when signed out
  // Search bar for groups where you can filter by course/class/professor?
  return (
    <div>
      <p>Join a Group...</p>
      <p>Can't find a group? <Link to="/new-group">Create a new one</Link>.</p>
    </div>
  );
}
