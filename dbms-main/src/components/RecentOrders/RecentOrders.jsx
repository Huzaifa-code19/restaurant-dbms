import './RecentOrder.css'
import { recentOrders } from '../../data/mockData.js'
import { useNavigate } from 'react-router-dom';
const RecentOrders = () => {
  const navigate = useNavigate();
  return (
    
      <section className="recent-orders">
        <div className="recent-orders-header">
          <div>
            <h2>Recent Orders</h2>
            <p>Here's what's happening with your latest orders.</p>
          </div>

          <button className="view-all-btn" onClick={() => navigate('/orders')}>
            View All →
          </button>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Order Type</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="order-id">#{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.orderType}</td>
                  <td className="order-total">
                    Rs. {order.total.toLocaleString()}
                  </td>
                  <td>
                    <span
                      className={`order-status ${order.status.toLowerCase()}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`payment-status ${order.paymentStatus.toLowerCase()}`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
  )
}

export default RecentOrders