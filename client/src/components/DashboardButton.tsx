import { Link } from 'react-router';

export default function DashboardButton() {
  return (
    <div className="flex flex-col items-end">
      <Link 
        to="/dashboard"
        className="px-4 py-2 mx-2.5 my-5 rounded-lg text-sm font-medium
                   text-blue-600 dark:text-blue-400
                   border border-blue-200 dark:border-blue-900
                   hover:bg-blue-50 dark:hover:bg-blue-900/30
                   hover:border-blue-300 dark:hover:border-blue-800
                   focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400
                   focus:outline-none
                   cursor-pointer
                   transition-all"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
