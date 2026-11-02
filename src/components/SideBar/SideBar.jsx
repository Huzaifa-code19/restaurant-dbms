import { NavLink } from "react-router-dom";
import "./sidebar.css";
const Sidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/" },
    { name: "Tables", path: "/tables" },
    { name: "Menu", path: "/menu" },
    { name: "Orders", path: "/orders" },
    { name: "Reservations", path: "/reservations" },
    { name: "Payments", path: "/payments" },
    { name: "Staff", path: "/staff" },
  ];

  return (
    <aside className="sidebar">
   
      <div className="sidebar-section">
        
        <ul className="sidebar-list">
          {menuItems.map((item) => (
            <li className="sidebar-item" key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? "active" : ""}`
                }
              >
                <span>{item.name}</span>
                <span className="sidebar-arrow">›</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-avatar">A</div>
        <div className="sidebar-user">
          <p>Admin</p>
          <span>Restaurant Manager</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
