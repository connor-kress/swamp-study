import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthFetch } from "../hooks/useAuthFetch";

export default function LogoutButton() {
  const authFetch = useAuthFetch();
  const navigate = useNavigate();
  const [logoutAll, setLogoutAll] = useState(false);

  async function handleLogout() {
    const endpoint = logoutAll ? "/api/auth/logout-all"
                               : "/api/auth/logout";
    try {
      const response = await authFetch(endpoint, { method: "POST" });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Unknown error");
      }

      const data = await response.json();
      console.log("Logout successful:", data.message);
      // TODO: Update user state
      navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleLogout}
        type="button"
        className="px-4 py-2 rounded-lg text-sm font-medium
                   text-red-600 dark:text-red-400
                   border border-red-200 dark:border-red-900
                   hover:bg-red-50 dark:hover:bg-red-900/30
                   hover:border-red-300 dark:hover:border-red-800
                   focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400
                   focus:outline-none
                   cursor-pointer
                   transition-all"
      >
        Logout
      </button>

      <label className="flex items-center gap-2 text-sm text-gray-600
                       dark:text-gray-400 cursor-pointer">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600
                     text-blue-600 focus:ring-blue-500
                     dark:focus:ring-blue-400 dark:bg-gray-700
                     cursor-pointer"
          checked={logoutAll}
          onChange={() => setLogoutAll(prev => !prev)}
        />
        all sessions
      </label>
    </div>
  );
}
