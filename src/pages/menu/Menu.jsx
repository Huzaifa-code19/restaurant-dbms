import React, { useEffect, useState } from 'react'

const Menu = () => {
  const [menuItems, setMenuItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/api/menu')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setMenuItems(data)
        else setError('Backend error: ' + (data.error || 'unknown'))
      })
      .catch(() => setError('Could not reach the backend. Is node server.js running?'))
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h2>Menu</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Category</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {menuItems.map(item => (
            <tr key={item.item_id}>
              <td>{item.item_id}</td>
              <td>{item.name}</td>
              <td>{item.description}</td>
              <td>{item.category}</td>
              <td>Rs. {item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Menu
