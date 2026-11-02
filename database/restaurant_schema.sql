CREATE DATABASE restaurant_db;
GO
USE restaurant_db;
GO

CREATE TABLE categories (
  category_id INT IDENTITY(1,1) PRIMARY KEY,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE menu_items (
  item_id INT IDENTITY(1,1) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  price DECIMAL(8,2) NOT NULL,
  category_id INT,
  FOREIGN KEY (category_id) REFERENCES categories(category_id)
);

CREATE TABLE tables_ (
  table_id INT IDENTITY(1,1) PRIMARY KEY,
  table_number INT NOT NULL,
  capacity INT NOT NULL,
  status VARCHAR(20) DEFAULT 'available'
);

CREATE TABLE customers (
  customer_id INT IDENTITY(1,1) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20)
);

CREATE TABLE reservations (
  reservation_id INT IDENTITY(1,1) PRIMARY KEY,
  customer_id INT,
  table_id INT,
  reservation_time DATETIME NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
  FOREIGN KEY (table_id) REFERENCES tables_(table_id)
);

CREATE TABLE staff (
  staff_id INT IDENTITY(1,1) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(50)
);

CREATE TABLE orders (
  order_id INT IDENTITY(1,1) PRIMARY KEY,
  table_id INT,
  staff_id INT,
  order_date DATETIME DEFAULT GETDATE(),
  status VARCHAR(20) DEFAULT 'placed',
  total_amount DECIMAL(10,2) DEFAULT 0,
  FOREIGN KEY (table_id) REFERENCES tables_(table_id),
  FOREIGN KEY (staff_id) REFERENCES staff(staff_id)
);

CREATE TABLE order_items (
  order_item_id INT IDENTITY(1,1) PRIMARY KEY,
  order_id INT,
  item_id INT,
  quantity INT NOT NULL,
  price DECIMAL(8,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(order_id),
  FOREIGN KEY (item_id) REFERENCES menu_items(item_id)
);

CREATE TABLE payments (
  payment_id INT IDENTITY(1,1) PRIMARY KEY,
  order_id INT,
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  payment_date DATETIME DEFAULT GETDATE(),
  FOREIGN KEY (order_id) REFERENCES orders(order_id)
);
GO

INSERT INTO categories (name) VALUES ('Starters'), ('Main Course'), ('Beverages');

INSERT INTO menu_items (name, description, price, category_id) VALUES
('Soup', 'Hot and sour soup', 350, 1),
('Chicken Karahi', 'Served with naan', 1400, 2),
('Cold Drink', '330ml can', 100, 3);

INSERT INTO tables_ (table_number, capacity) VALUES (1, 2), (2, 4), (3, 6);
INSERT INTO staff (name, role) VALUES ('Ali', 'Waiter');
GO
