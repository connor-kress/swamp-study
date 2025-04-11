import { BrowserRouter, Routes, Route } from "react-router";
import DashboardScreen from "./screens/DashboardScreen";
import HomeScreen from "./screens/HomeScreen";
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import GroupSearchScreen from "./screens/GroupSearchScreen";
import NewGroupScreen from "./screens/NewGroupScreen";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />} />
        <Route path="/new-group" element={<NewGroupScreen />} />
        <Route path="/find-group" element={<GroupSearchScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
