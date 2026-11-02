import React, { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [tables, setTables] = useState([])
  const [staff, setStaff] = useState([])
  const [menu, setMenu] = useState([])
  const [quantities, setQuantities] = useState({})
  const [tableId, setTableId] = useState('')
  const [staffId, setStaffId] = useState('')
  const [viewing, setViewing] = useState(null)
  const [viewItems, setViewItems] = useState([])
  const [message, setMessage] = useState('')

  const loadOrders = () => {
    fetch(API + '/orders')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOrders(data)
        else setMessage('Backend error: ' + (data.error || 'unknown'))
      })
      .catch(() => setMessage('Could not reach the backend. Is node server.js running?'))
  }

  const loadTables = () => {
    fetch(API + '/tables')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTables(data) })
      .catch(() => {})
  }

  useEffect(() => {
    loadOrders()
    loadTables()
    fetch(API + '/staff').then(res => res.json())
      .then(data => { if (Array.isArray(data)) setStaff(data) }).catch(() => {})
    fetch(API + '/menu').then(res => res.json())
      .then(data => { if (Array.isArray(data)) setMenu(data) }).catch(() => {})
  }, [])

  const placeOrder = () => {
    const items = Object.keys(quantities)
      .filter(id => Number(quantities[id]) > 0)
      .map(id => ({ item_id: Number(id), quantity: Number(quantities[id]) }))

    if (!tableId || items.length === 0) {
      setMessage('Please choose a table and at least one item')
      return
    }

    fetch(API + '/orders/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_id: Number(tableId),
        staff_id: staffId ? Number(staffId) : null,
        items: items
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Order #' + data.order_id + ' placed')
          setQuantities({})
          setTableId('')
          setStaffId('')
          loadOrders()
          loadTables()
        } else setMessage('Error: ' + data.error)
      })
  }

  const changeStatus = (id, status) => {
    fetch(API + '/orders/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) { setMessage('Status updated'); loadOrders() }
        else setMessage('Error: ' + data.error)
      })
  }

  const viewOrder = (id) => {
    if (viewing === id) { setViewing(null); return }
    fetch(API + '/orders/' + id + '/items')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) { setViewItems(data); setViewing(id) }
        else setMessage('Error: ' + data.error)
      })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Orders</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <h3>New order</h3>
      <div style={{ marginBottom: '10px' }}>
        <select value={tableId} onChange={e => setTableId(e.target.value)}>
          <option value="">Table</option>
          {tables.map(t => (
            <option key={t.table_id} value={t.table_id}>
              Table {t.table_number} ({t.status})
            </option>
          ))}
        </select>{' '}
        <select value={staffId} onChange={e => setStaffId(e.target.value)}>
          <option value="">Waiter</option>
          {staff.map(s => (
            <option key={s.staff_id} value={s.staff_id}>{s.name}</option>
          ))}
        </select>
      </div>

      <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', marginBottom: '10px' }}>
        <thead>
          <tr><th>Item</th><th>Price (Rs.)</th><th>Quantity</th></tr>
        </thead>
        <tbody>
          {menu.map(m => (
            <tr key={m.item_id}>
              <td>{m.name}</td>
              <td>{m.price}</td>
              <td>
                <input type="number" min="0" style={{ width: '70px' }}
                  value={quantities[m.item_id] || ''}
                  onChange={e => setQuantities({ ...quantities, [m.item_id]: e.target.value })} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={placeOrder}>Place order</button>

      <h3 style={{ marginTop: '30px' }}>All orders</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Order</th>
            <th>Table</th>
            <th>Waiter</th>
            <th>Date and time</th>
            <th>Total (Rs.)</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map(o => (
            <React.Fragment key={o.order_id}>
              <tr>
                <td>{o.order_id}</td>
                <td>{o.table_number}</td>
                <td>{o.staff}</td>
                <td>{o.order_date}</td>
                <td>{o.total_amount}</td>
                <td>
                  <select value={o.status} onChange={e => changeStatus(o.order_id, e.target.value)}>
                    <option value="placed">placed</option>
                    <option value="preparing">preparing</option>
                    <option value="served">served</option>
                    <option value="billed">billed</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => viewOrder(o.order_id)}>
                    {viewing === o.order_id ? 'Hide' : 'View items'}
                  </button>
                </td>
              </tr>
              {viewing === o.order_id && (
                <tr>
                  <td colSpan="7">
                    {viewItems.map((it, i) => (
                      <div key={i}>
                        {it.quantity} x {it.name} @ Rs. {it.price} = Rs. {it.subtotal}
                      </div>
                    ))}
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Orders
