import { useEffect, useState } from 'react';
import './dashboard.css';
import { dashboardStats } from '../../data/mockData.js';
import RecentOrders from '../../components/RecentOrders/RecentOrders.jsx';
import WeeklyRevenue from '../../components/weeklyRevenue/weeklyRevenue.jsx';
import PopularMenuItems from '../../components/PopularItems/PopularItems.jsx';

const DashBoard = () => {
  const [data, setData] = useState([]);

  useEffect(() => {

    setData(dashboardStats);

  }, []);

  return (
    <>
      <div className="dashboard-container">
        {data.map((dashboard) => (
          <div key={dashboard.id} className="dashboard-card" style={{ backgroundColor: dashboard.color }}>
            <h3>{dashboard.title}</h3>
            <p>{dashboard.prefix}{dashboard.value.toLocaleString()}</p>
            <p className={`dashboard-change ${dashboard.trend}`}>
              {dashboard.trend === 'up' ? '▲' : '▼'} {dashboard.change}%
            </p>
            <p>{dashboard.description}</p>
          </div>
        ))}
      </div>

        <RecentOrders />
        <WeeklyRevenue />
        <PopularMenuItems />
    </>
  );
};

export default DashBoard;