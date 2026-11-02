import React, { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api'

const Payments = () => {
  const [payments, setPayments] = useState([])
  const [orders, setOrders] = useState([])
  const [orderId, setOrderId] = useState('')
  const [message, setMessage] = useState('')

  const loadAll = () => {
    fetch(API + '/payments')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setPayments(data)
        else setMessage('Backend error: ' + (data.error || 'unknown'))
      })
      .catch(() => setMessage('Could not reach the backend. Is node server.js running?'))

    fetch(API + '/orders')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setOrders(data) })
      .catch(() => {})
  }

  useEffect(() => { loadAll() }, [])

  const generateBill = () => {
    if (!orderId) {
      setMessage('Please choose an order')
      return
    }
    fetch(API + '/payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: Number(orderId) })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) { setMessage('Bill generated'); setOrderId(''); loadAll() }
        else setMessage('Error: ' + data.error)
      })
  }

  const markPaid = (id) => {
    fetch(API + '/payments/' + id + '/pay', { method: 'PUT' })
      .then(res => res.json())
      .then(data => {
        if (data.success) { setMessage('Payment received, table is free again'); loadAll() }
        else setMessage('Error: ' + data.error)
      })
  }

  const unbilled = orders.filter(o => o.status !== 'billed')

  return (
    <div style={{ padding: '20px' }}>
      <h2>Payments</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <h3>Generate bill</h3>
      <div style={{ marginBottom: '20px' }}>
        <select value={orderId} onChange={e => setOrderId(e.target.value)}>
          <option value="">Choose order</option>
          {unbilled.map(o => (
            <option key={o.order_id} value={o.order_id}>
              Order #{o.order_id} - Table {o.table_number} - Rs. {o.total_amount}
            </option>
          ))}
        </select>{' '}
        <button onClick={generateBill}>Generate bill</button>
      </div>

      <h3>All bills</h3>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>Bill</th>
            <th>Order</th>
            <th>Table</th>
            <th>Amount (Rs.)</th>
            <th>Status</th>
            <th>Date and time</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {payments.map(p => (
            <tr key={p.payment_id}>
              <td>{p.payment_id}</td>
              <td>{p.order_id}</td>
              <td>{p.table_number}</td>
              <td>{p.amount}</td>
              <td>{p.status}</td>
              <td>{p.payment_date}</td>
              <td>
                {p.status === 'pending' && (
                  <button onClick={() => markPaid(p.payment_id)}>Mark paid</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Payments
