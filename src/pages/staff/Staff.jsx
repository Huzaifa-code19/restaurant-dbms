import React, { useEffect, useState } from 'react'

const API = 'http://localhost:5000/api/staff'

const Staff = () => {
  const [staff, setStaff] = useState([])
  const [form, setForm] = useState({ name: '', role: '' })
  const [message, setMessage] = useState('')

  const loadStaff = () => {
    fetch(API)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStaff(data)
        else setMessage('Backend error: ' + (data.error || 'unknown'))
      })
      .catch(() => setMessage('Could not reach the backend. Is node server.js running?'))
  }

  useEffect(() => { loadStaff() }, [])

  const addStaff = () => {
    if (!form.name || !form.role) {
      setMessage('Please fill name and role')
      return
    }
    fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMessage('Staff member added')
          setForm({ name: '', role: '' })
          loadStaff()
        } else setMessage('Error: ' + data.error)
      })
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Staff</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}

      <div style={{ marginBottom: '20px' }}>
        <input placeholder="Name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} />{' '}
        <input placeholder="Role (e.g. Waiter)" value={form.role}
          onChange={e => setForm({ ...form, role: e.target.value })} />{' '}
        <button onClick={addStaff}>Add staff</button>
      </div>

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {staff.map(s => (
            <tr key={s.staff_id}>
              <td>{s.staff_id}</td>
              <td>{s.name}</td>
              <td>{s.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Staff
