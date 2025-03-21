import LogoutButton from "../components/LogoutButton";
import SwampStudy from "../components/SwampStudy";

export default function DashboardScreen() {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1><SwampStudy /> Dashboard</h1>
      <LogoutButton />
    </div>
  );
}
