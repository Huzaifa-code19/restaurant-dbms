import { Outlet } from "react-router-dom";
import Sidebar from "../components/SideBar/SideBar.jsx";
import Navbar from "../components/Navbar/Navbar.jsx";
import "./dashboardLayout.css";

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <div className="dashboard-main">
        <Navbar />

        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;