import LogoutButton from "../components/LogoutButton";
import SwampStudy from "../components/SwampStudy";
import { Link } from "react-router";

export default function DashboardScreen() {
  // Redirect to login screen when signed out
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-gray-50">
          <SwampStudy /> Dashboard
        </h1>
        <LogoutButton />
      </div>

      {/* Main Actions */}
      <div className="flex gap-4 mb-12">
        <Link to="/new-group">
          <button className="px-6 py-3 rounded-lg text-white
                             bg-blue-600 hover:bg-blue-700
                             dark:bg-blue-500 dark:hover:bg-blue-600
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:ring-offset-2 dark:focus:ring-offset-gray-800
                             font-medium transition">
            Create a Group
          </button>
        </Link>

        <Link to="/find-group">
          <button className="px-6 py-3 rounded-lg bg-white dark:bg-gray-800
                             border border-gray-300 dark:border-gray-600
                             text-gray-900 dark:text-gray-100
                             hover:bg-gray-50 dark:hover:bg-gray-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:ring-offset-2 dark:focus:ring-offset-gray-800
                             font-medium transition">
            Join a Group
          </button>
        </Link>
      </div>

      {/* My Groups Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold dark:text-gray-100">My Groups</h2>

        {/* Groups Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Example Group Cards */}
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700
                          shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold dark:text-gray-100">
                Calculus 3 Study Group
              </h3>
              <span className="px-2 py-1 text-sm rounded-full
                               bg-green-100 dark:bg-green-900/30
                               text-green-700 dark:text-green-400">
                Active
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Next meeting: Tomorrow at 3:00 PM
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-500">
                4 members
              </span>
              <button className="text-blue-600 dark:text-blue-400
                                 hover:text-blue-700 dark:hover:text-blue-300
                                 text-sm font-medium">
                View Group
              </button>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-white dark:bg-gray-800
                          border border-gray-200 dark:border-gray-700
                          shadow-sm hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold dark:text-gray-100">
                Programming Team
              </h3>
              <span className="px-2 py-1 text-sm rounded-full
                               bg-yellow-100 dark:bg-yellow-900/30
                               text-yellow-700 dark:text-yellow-400">
                Pending
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Meeting schedule TBD
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 dark:text-gray-500">
                6 members
              </span>
              <button className="text-blue-600 dark:text-blue-400
                                 hover:text-blue-700 dark:hover:text-blue-300
                                 text-sm font-medium">
                View Group
              </button>
            </div>
          </div>

          {/* Add Group Card */}
          <Link to="/find-group">
            <div className="p-6 rounded-xl border-2 border-dashed
                            border-gray-300 dark:border-gray-600
                            hover:border-blue-500 dark:hover:border-blue-400
                            flex items-center justify-center
                            h-full transition cursor-pointer">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-100
                                dark:bg-blue-900/30 flex items-center
                                justify-center mx-auto mb-3">
                  {/* Plus SVG */}
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400"
                       fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-blue-600 dark:text-blue-400 font-medium">
                  Join More Groups
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
