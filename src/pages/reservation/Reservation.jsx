import React, { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/reservations'
const emptyForm = { name: '', phone: '', table_id: '', reservation_time: '' }

const Reservation = () => {
  const [reservations, setReservations] = useState([])
  const [tables, setTables] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [message, setMessage] = useState('')

  const loadReservations = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setReservations(data)
        else setMessage('Backend error: ' + (data.error || 'unknown'))
      })
      .catch(() => setMessage('Could not reach the backend. Is node server.js running?'))
  }

  const loadTables = () => {
    fetch('http://localhost:5000/api/tables')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setTables(data) })
      .catch(() => {})
  }

  useEffect(() => {
    loadReservations()
    loadTables()
  }, [])

  const addReservation = () => {
    if (!form.name || !form.table_id || !form.reservation_time) {
      setMessage('Please fill name, table and date/time')
      return
    }
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        phone: form.phone,
        table_id: Number(form.table_id),
        reservation_time: form.reservation_time
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Reservation added')
          setForm(emptyForm)
          loadReservations()
          loadTables()
        } else setMessage('Error: ' + data.error)
      })
  }

  const cancelReservation = (id) => {
    if (!window.confirm('Cancel this reservation?')) return
    fetch(API + '/' + id, { method: 'DELETE' })
      .then(res => res.json())
      .then(data => {
        if (data.success) { setMessage('Reservation cancelled'); loadReservations() }
        else setMessage('Error: ' + data.error)
      })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Reservations</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div style={{ marginBottom: '20px' }}>
        <input placeholder="Customer name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} />{' '}
        <input placeholder="Phone" value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })} />{' '}
        <select value={form.table_id}
          onChange={e => setForm({ ...form, table_id: e.target.value })}>
          <option value="">Table</option>
          {tables.map(t => (
            <option key={t.table_id} value={t.table_id}>
              Table {t.table_number} (seats {t.capacity}, {t.status})
            </option>
          ))}
        </select>{' '}
        <input type="datetime-local" value={form.reservation_time}
          onChange={e => setForm({ ...form, reservation_time: e.target.value })} />{' '}
        <button onClick={addReservation}>Add reservation</button>
      </div>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Customer</th>
            <th>Phone</th>
            <th>Table</th>
            <th>Date and time</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(r => (
            <tr key={r.reservation_id}>
              <td>{r.reservation_id}</td>
              <td>{r.customer}</td>
              <td>{r.phone}</td>
              <td>{r.table_number}</td>
              <td>{r.reservation_time}</td>
              <td>
                <button onClick={() => cancelReservation(r.reservation_id)}>Cancel</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Reservation
