import NavBar from "../components/NavBar";
import SwampStudy from "../components/SwampStudy";


export default function NewGroupScreen() {
  // Redirect to login screen when signed out
  return (
    <>
      <NavBar />
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h1><SwampStudy /> Create Room</h1>
        <p>Room creation functionality will be implemented here.</p>
      </div>
    </>
  );
}
