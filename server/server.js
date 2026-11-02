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
// GET all orders (JOIN across orders, tables and staff)
app.get('/api/orders', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT o.order_id, t.table_number, s.name AS staff, o.status, o.total_amount,
             CONVERT(VARCHAR(16), o.order_date, 120) AS order_date
      FROM orders o
      JOIN tables_ t ON o.table_id = t.table_id
      LEFT JOIN staff s ON o.staff_id = s.staff_id
      ORDER BY o.order_id DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET the items inside one order
app.get('/api/orders/:id/items', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, req.params.id)
      .query(`
        SELECT m.name, oi.quantity, oi.price, oi.quantity * oi.price AS subtotal
        FROM order_items oi
        JOIN menu_items m ON oi.item_id = m.item_id
        WHERE oi.order_id = @id
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE an order with its items (one transaction: all steps succeed or none do)
app.post('/api/orders/new', async (req, res) => {
  const { table_id, staff_id, items } = req.body;
  if (!table_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'Choose a table and at least one item' });
  }
  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    const orderResult = await new sql.Request(transaction)
      .input('table_id', sql.Int, table_id)
      .input('staff_id', sql.Int, staff_id || null)
      .query('INSERT INTO orders (table_id, staff_id) OUTPUT INSERTED.order_id VALUES (@table_id, @staff_id)');
    const order_id = orderResult.recordset[0].order_id;

    for (const it of items) {
      await new sql.Request(transaction)
        .input('order_id', sql.Int, order_id)
        .input('item_id', sql.Int, it.item_id)
        .input('quantity', sql.Int, it.quantity)
        .query('INSERT INTO order_items (order_id, item_id, quantity, price) SELECT @order_id, item_id, @quantity, price FROM menu_items WHERE item_id = @item_id');
    }

    await new sql.Request(transaction)
      .input('order_id', sql.Int, order_id)
      .query('UPDATE orders SET total_amount = (SELECT SUM(quantity * price) FROM order_items WHERE order_id = @order_id) WHERE order_id = @order_id');

    await new sql.Request(transaction)
      .input('table_id', sql.Int, table_id)
      .query("UPDATE tables_ SET status = 'occupied' WHERE table_id = @table_id");

    await transaction.commit();
    res.json({ success: true, order_id: order_id });
  } catch (err) {
    try { await transaction.rollback(); } catch (e) {}
    res.status(500).json({ error: err.message });
  }
});

// UPDATE an order's status
app.put('/api/orders/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .input('status', sql.VarChar(20), req.body.status)
      .query('UPDATE orders SET status = @status WHERE order_id = @id');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all payments (JOIN across payments, orders and tables)
app.get('/api/payments', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT p.payment_id, p.order_id, t.table_number, p.amount, p.status,
             CONVERT(VARCHAR(16), p.payment_date, 120) AS payment_date
      FROM payments p
      JOIN orders o ON p.order_id = o.order_id
      JOIN tables_ t ON o.table_id = t.table_id
      ORDER BY p.payment_id DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GENERATE a bill for an order
app.post('/api/payments', async (req, res) => {
  try {
    const { order_id } = req.body;
    const pool = await poolPromise;
    const ord = await pool.request()
      .input('order_id', sql.Int, order_id)
      .query('SELECT total_amount FROM orders WHERE order_id = @order_id');
    if (ord.recordset.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    await pool.request()
      .input('order_id', sql.Int, order_id)
      .input('amount', sql.Decimal(10, 2), ord.recordset[0].total_amount)
      .query("INSERT INTO payments (order_id, amount, status) VALUES (@order_id, @amount, 'pending')");
    await pool.request()
      .input('order_id', sql.Int, order_id)
      .query("UPDATE orders SET status = 'billed' WHERE order_id = @order_id");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// MARK a payment as paid (and free the table)
app.put('/api/payments/:id/pay', async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query("UPDATE payments SET status = 'paid', payment_date = GETDATE() WHERE payment_id = @id");
    await pool.request()
      .input('id', sql.Int, req.params.id)
      .query("UPDATE tables_ SET status = 'available' WHERE table_id = (SELECT o.table_id FROM payments p JOIN orders o ON p.order_id = o.order_id WHERE p.payment_id = @id)");
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DASHBOARD: all the summary numbers, worked out with SQL
app.get('/api/dashboard', async (req, res) => {
  try {
    const pool = await poolPromise;

    // 1. The four stat cards
    const s = await pool.request().query(`
      SELECT
        (SELECT ISNULL(SUM(amount), 0) FROM payments WHERE status = 'paid') AS revenue,
        (SELECT COUNT(*) FROM orders) AS orders,
        (SELECT COUNT(*) FROM reservations) AS reservations,
        (SELECT COUNT(*) FROM tables_ WHERE status = 'available') AS available,
        (SELECT COUNT(*) FROM tables_) AS total_tables
    `);
    const st = s.recordset[0];
    const dashboardStats = [
      { id: 1, title: 'Total Revenue', value: st.revenue, prefix: 'Rs. ', change: 0, trend: 'up', description: 'from paid bills', color: '#31c300' },
      { id: 2, title: 'Total Orders', value: st.orders, change: 0, trend: 'up', description: 'all time', color: '#452ef7' },
      { id: 3, title: 'Reservations', value: st.reservations, change: 0, trend: 'up', description: 'all time', color: '#f93adf' },
      { id: 4, title: 'Available Tables', value: st.available, total: st.total_tables, change: 0, trend: 'up', description: 'tables available now', color: '#f5ab3c' }
    ];

    // 2. The 5 most recent orders
    const ro = await pool.request().query(`
      SELECT TOP 5
        o.order_id AS id,
        'Table ' + CAST(t.table_number AS VARCHAR(10)) AS customer,
        o.total_amount AS total,
        CASE o.status
          WHEN 'placed' THEN 'Pending'
          WHEN 'preparing' THEN 'Preparing'
          ELSE 'Completed'
        END AS status,
        ISNULL((SELECT TOP 1 CASE p.status WHEN 'paid' THEN 'Paid' ELSE 'Pending' END
                FROM payments p WHERE p.order_id = o.order_id
                ORDER BY p.payment_id DESC), 'Pending') AS paymentStatus,
        'Dine-in' AS orderType,
        'T-' + RIGHT('0' + CAST(t.table_number AS VARCHAR(10)), 2) AS [table],
        CONVERT(VARCHAR(5), o.order_date, 108) AS [time]
      FROM orders o
      JOIN tables_ t ON o.table_id = t.table_id
      ORDER BY o.order_id DESC
    `);
    const recentOrders = ro.recordset;
    recentOrders.forEach(o => { o.items = []; });

    if (recentOrders.length > 0) {
      const ids = recentOrders.map(o => o.id).join(',');
      const it = await pool.request().query(`
        SELECT oi.order_id, m.name
        FROM order_items oi
        JOIN menu_items m ON oi.item_id = m.item_id
        WHERE oi.order_id IN (${ids})
      `);
      it.recordset.forEach(row => {
        const order = recentOrders.find(o => o.id === row.order_id);
        if (order) order.items.push(row.name);
      });
    }

    // 3. Revenue and orders for each of the last 7 days
    const wr = await pool.request().query(`
      WITH d AS (
        SELECT CAST(GETDATE() AS DATE) AS dt
        UNION ALL
        SELECT DATEADD(day, -1, dt) FROM d
        WHERE dt > DATEADD(day, -6, CAST(GETDATE() AS DATE))
      )
      SELECT LEFT(DATENAME(weekday, d.dt), 3) AS day,
             ISNULL(SUM(o.total_amount), 0) AS revenue,
             COUNT(o.order_id) AS orders
      FROM d
      LEFT JOIN orders o ON CAST(o.order_date AS DATE) = d.dt
      GROUP BY d.dt
      ORDER BY d.dt
    `);

    // 4. Top 5 most ordered menu items
    const pi = await pool.request().query(`
      SELECT TOP 5
        m.item_id AS id, m.name, ISNULL(c.name, '') AS category,
        SUM(oi.quantity) AS totalOrders, m.price
      FROM order_items oi
      JOIN menu_items m ON oi.item_id = m.item_id
      LEFT JOIN categories c ON m.category_id = c.category_id
      GROUP BY m.item_id, m.name, c.name, m.price
      ORDER BY SUM(oi.quantity) DESC
    `);

    res.json({
      dashboardStats: dashboardStats,
      recentOrders: recentOrders,
      weeklyRevenue: wr.recordset,
      popularItems: pi.recordset
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.listen(5000, () => console.log('Server running on http://localhost:5000'));



