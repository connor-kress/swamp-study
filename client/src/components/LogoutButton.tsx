import { useState } from "react";
import { useNavigate } from "react-router";

export default function LogoutButton() {
  const navigate = useNavigate();
  const [logoutAll, setLogoutAll] = useState(false);

  async function handleLogout() {
    const endpoint = logoutAll ? "/api/auth/logout-all"
                               : "/api/auth/logout";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        credentials: "include",
      });

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
    <div>
      <label>
        <input
          type="checkbox"
          checked={logoutAll}
          onChange={() => setLogoutAll(prev => !prev)}
        />
        Log out of all sessions
      </label>
      <br />
      <button onClick={handleLogout} type="button">
        Logout
      </button>
    </div>
  );
}
