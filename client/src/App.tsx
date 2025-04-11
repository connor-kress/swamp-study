import { BrowserRouter, Routes, Route } from "react-router";
import DashboardScreen from "./screens/DashboardScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import JoinRoomScreen from "./screens/joinRoom";
import CreateRoomScreen from "./screens/createRoom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/createRoom" element={<CreateRoomScreen />} />
        <Route path="/joinRoom" element={<JoinRoomScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
