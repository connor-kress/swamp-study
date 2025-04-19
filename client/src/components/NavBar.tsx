import DashboardButton from "./DashboardButton";
import LogoutButton from "./LogoutButton";

export default function NavBar() {
  return (
    <div className="flex justify-between w-full pl-3 pr-3">
      <LogoutButton />
      <DashboardButton />
    </div>
  );
}
