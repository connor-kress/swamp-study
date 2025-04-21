import DashboardButton from "./DashboardButton";
import LogoutButton from "./LogoutButton";

export default function NavBar() {
  return (
    <div className="flex justify-between w-full px-4 py-4">
      <DashboardButton />
      <LogoutButton />
    </div>
  );
}
