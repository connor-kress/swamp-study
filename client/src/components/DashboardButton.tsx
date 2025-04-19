import { Link } from 'react-router';

export default function DashboardButton() {
  return (
    <Link to="/dashboard">
      <button className="my-6 mx-3 py-3 px-6">
        Back to Dashboard
      </button>
    </Link>
  );
}
