import LogoutButton from "./LogoutButton"
import DashboardButton from "./DashboardButton"

export default function NavBar() {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', paddingLeft: '10px', paddingRight: '10px' }}>
      <LogoutButton />
      <DashboardButton />
    </div>
  );
}