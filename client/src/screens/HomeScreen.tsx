import Button from "../components/Button";
import SwampStudy from "../components/SwampStudy";
import { useOptionalUser } from "../hooks/useOptionalUser";

export default function HomeScreen() {
  const { user } = useOptionalUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        {/* Welcome Text */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight
                         dark:text-gray-50">
            Welcome to <SwampStudy />
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Your ultimate study companion for academic success
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {user && (
            <Button to="/dashboard" variant="primary">Dashboard</Button>
          ) || (
            <Button to="/login" variant="primary">Login</Button>
          )}
          <Button to="/register" variant="secondary">Sign Up</Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-600 dark:text-gray-400 pt-8">
          Join the couple of students already using SwampStudy
        </p>
      </div>
    </div>
  );
}
