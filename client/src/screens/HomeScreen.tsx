import { Link } from "react-router";
import SwampStudy from "../components/SwampStudy";

export default function HomeScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Hero Section */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight
                         dark:text-gray-50">
            Welcome to <SwampStudy />
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your ultimate study companion for academic success
          </p>
        </div>

        {/* Login and Signup Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <button className="w-full sm:w-auto px-8 py-3 rounded-lg
                             bg-blue-600 dark:bg-blue-500 text-white
                             hover:bg-blue-700 dark:hover:bg-blue-600
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:ring-offset-2 dark:focus:ring-offset-gray-800
                             font-medium transition">
              Login
            </button>
          </Link>
          <Link to="/register">
            <button className="w-full sm:w-auto px-8 py-3 rounded-lg
                             bg-white dark:bg-gray-800
                             text-gray-900 dark:text-gray-100
                             border border-gray-300 dark:border-gray-600
                             hover:bg-gray-50 dark:hover:bg-gray-700
                             focus:outline-none focus:ring-2 focus:ring-blue-500
                             focus:ring-offset-2 dark:focus:ring-offset-gray-800
                             font-medium transition">
              Sign Up
            </button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-600 dark:text-gray-400 pt-8">
          Join the couple of students already using SwampStudy
        </p>
      </div>
    </div>
  );
}
