import { Link } from 'react-router';

export default function DashboardButton() {
    return (
        <Link to="/dashboard" style={{ textAlign: 'right' }}>
            <button style={{ margin: '20px 10px', padding: '10px 20px' }}>
              Back to Dashboard
            </button>
        </Link>
    );
}