import { Routes, Route } from 'react-router-dom'
import DashBoardLayout from './layouts/DashBoardLayout.jsx'
import Dashboard from './pages/dashboard/DashBoard.jsx'
import Tables from './pages/tables/Tables.jsx'
import Menu from './pages/menu/Menu.jsx'
import Orders from './pages/orders/Orders.jsx'
import Reservation from './pages/reservation/Reservation.jsx'
import Payments from './pages/payments/Payments.jsx'
import Staff from './pages/staff/Staff.jsx'
const App = () => {
  return (
    <div className='app'>
      <Routes>
        <Route path="/" element={<DashBoardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="tables" element={<Tables />} />
          <Route path="menu" element={<Menu />} />
          <Route path="orders" element={<Orders />} />
          <Route path="reservations" element={<Reservation />} />
          <Route path="payments" element={<Payments />} />
          <Route path="staff" element={<Staff />} />
        </Route>
      </Routes>
    </div>
  )
}

export default App