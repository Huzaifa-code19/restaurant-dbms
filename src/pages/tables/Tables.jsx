import React, { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/tables'

const Tables = () => {
  const [tables, setTables] = useState([])
  const [form, setForm] = useState({ table_number: '', capacity: '' })
  const [message, setMessage] = useState('')

  const loadTables = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setTables(data)
        else setMessage('Backend error: ' + (data.error || 'unknown'))
      })
      .catch(() => setMessage('Could not reach the backend. Is node server.js running?'))
  }

  useEffect(() => { loadTables() }, [])

  const changeStatus = (id, status) => {
    fetch(API + '/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: status })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) { setMessage('Status updated'); loadTables() }
        else setMessage('Error: ' + data.error)
      })
  }

  const addTable = () => {
    if (!form.table_number || !form.capacity) {
      setMessage('Please fill table number and capacity')
      return
    }
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        table_number: Number(form.table_number),
        capacity: Number(form.capacity)
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Table added')
          setForm({ table_number: '', capacity: '' })
          loadTables()
        } else setMessage('Error: ' + data.error)
      })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Tables</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div style={{ marginBottom: '20px' }}>
        <input placeholder="Table number" type="number" style={{ width: '120px' }}
          value={form.table_number}
          onChange={e => setForm({ ...form, table_number: e.target.value })} />{' '}
        <input placeholder="Capacity" type="number" style={{ width: '100px' }}
          value={form.capacity}
          onChange={e => setForm({ ...form, capacity: e.target.value })} />{' '}
        <button onClick={addTable}>Add table</button>
      </div>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Table number</th>
            <th>Capacity</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tables.map(t => (
            <tr key={t.table_id}>
              <td>{t.table_id}</td>
              <td>{t.table_number}</td>
              <td>{t.capacity}</td>
              <td>
                <select value={t.status} onChange={e => changeStatus(t.table_id, e.target.value)}>
                  <option value="available">available</option>
                  <option value="occupied">occupied</option>
                  <option value="reserved">reserved</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Tables
