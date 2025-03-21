import { useNavigate } from "react-router";

export default function LogoutButton() {
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
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
    <button onClick={handleLogout} type="button">
      Logout
    </button>
  );
}
