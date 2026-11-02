// Setup (in a "server" folder inside your project):
//   npm init -y
//   npm install express mssql cors
// Run:  node server.js
// Test: open http://localhost:5000/api/menu in your browser

const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const config = {
  user: 'sa',                  // your SQL Server login
  password: 'Restaurant@123',    // 
  server: 'localhost',
  port: 1433,
  database: 'restaurant_db',
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

// One shared connection pool for the whole app
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to SQL Server');
    return pool;
  })
  .catch(err => console.error('DB connection failed:', err.message));

// GET all menu items (with category name, uses a JOIN)
app.get('/api/menu', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT m.item_id, m.name, m.description, m.price, c.name AS category
      FROM menu_items m
      LEFT JOIN categories c ON m.category_id = c.category_id
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all tables
app.get('/api/tables', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM tables_');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a new order
app.post('/api/orders', async (req, res) => {
  try {
    const { table_id, staff_id } = req.body;
    const pool = await poolPromise;
    const result = await pool.request()
      .input('table_id', sql.Int, table_id)
      .input('staff_id', sql.Int, staff_id)
      .query(`
        INSERT INTO orders (table_id, staff_id)
        OUTPUT INSERTED.order_id
        VALUES (@table_id, @staff_id)
      `);
    res.json({ order_id: result.recordset[0].order_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE a table's status
app.put('/api/tables/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.VarChar(20), req.body.status)
      .query('UPDATE tables_ SET status = @status WHERE table_id = @id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a table
app.post('/api/tables', async (req, res) => {
  try {
    const { table_number, capacity } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('table_number', sql.Int, table_number)
      .input('capacity', sql.Int, capacity)
      .query('INSERT INTO tables_ (table_number, capacity) VALUES (@table_number, @capacity)');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all staff
app.get('/api/staff', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM staff');
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a staff member
app.post('/api/staff', async (req, res) => {
  try {
    const { name, role } = req.body;
    const pool = await poolPromise;
    await pool.request()
      .input('name', sql.VarChar(100), name)
      .input('role', sql.VarChar(50), role)
      .query('INSERT INTO staff (name, role) VALUES (@name, @role)');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all reservations (JOIN across 3 tables)
app.get('/api/reservations', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.reservation_id, c.name AS customer, c.phone,
             t.table_number,
             CONVERT(VARCHAR(16), r.reservation_time, 120) AS reservation_time
      FROM reservations r
      JOIN customers c ON r.customer_id = c.customer_id
      JOIN tables_ t ON r.table_id = t.table_id
      ORDER BY r.reservation_time
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE a reservation (adds the customer, then the reservation, then marks the table reserved)
app.post('/api/reservations', async (req, res) => {
  try {
    const { name, phone, table_id, reservation_time } = req.body;
    const pool = await poolPromise;

    const cust = await pool.request()
      .input('name', sql.VarChar(100), name)
      .input('phone', sql.VarChar(20), phone)
      .query('INSERT INTO customers (name, phone) OUTPUT INSERTED.customer_id VALUES (@name, @phone)');
    const customer_id = cust.recordset[0].customer_id;

    await pool.request()
      .input('customer_id', sql.Int, customer_id)
      .input('table_id', sql.Int, table_id)
      .input('time', sql.VarChar(30), reservation_time + ':00')
      .query('INSERT INTO reservations (customer_id, table_id, reservation_time) VALUES (@customer_id, @table_id, CAST(@time AS DATETIME))');

    await pool.request()
      .input('table_id', sql.Int, table_id)
      .query("UPDATE tables_ SET status = 'reserved' WHERE table_id = @table_id");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE (cancel) a reservation
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query('DELETE FROM reservations WHERE reservation_id = @id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(5000, () => console.log('Server running on http://localhost:5000'));

