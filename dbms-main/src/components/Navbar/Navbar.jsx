
import { useLocation } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
  const location = useLocation();

  const pageNames = {
    "/dashboard": "Dashboard",
    "/tables": "Tables",
    "/menu": "Menu Management",
    "/orders": "Orders",
    "/reservations": "Reservations",
    "/payments": "Payments",
    "/staff": "Staff Management",
  };

  const pageTitle = pageNames[location.pathname] || "Dashboard";

  return (
    <header className="navbar">
      <div className="navbar-heading">
        <h1>{pageTitle}</h1>
        <p>Welcome back! Here's what's happening today.</p>
      </div>

      <div className="navbar-actions">
        <div className="navbar-profile">
          <div className="profile-avatar">A</div>
          <div className="profile-info">
            <span className="profile-name">Admin</span>
            <span className="profile-role">Administrator</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;