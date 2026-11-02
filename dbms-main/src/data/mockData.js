const dashboardStats = [
  {
    id: 1,
    title: "Total Revenue",
    value: 125800,
    prefix: "Rs. ",
    change: 12.5,
    trend: "up",
    description: "vs. last month",
    color: "#31c300"
  },
  {
    id: 2,
    title: "Total Orders",
    value: 342,
    change: 8.2,
    trend: "up",
    description: "vs. last month",
    color: "#452ef7"
  },
  {
    id: 3,
    title: "Reservations",
    value: 86,
    change: 4.6,
    trend: "up",
    description: "vs. last month",
    color: "#f93adf"
  },
  {
    id: 4,
    title: "Available Tables",
    value: 8,
    total: 20,
    change: 2,
    trend: "up",
    description: "tables available now",
    color: "#f5ab3c"
  },
];





const recentOrders = [
  {
    id: 1001,
    customer: "Ahmed Khan",
    items: ["Zinger Burger", "Fries", "Cola"],
    total: 1850,
    status: "Completed",
    paymentStatus: "Paid",
    orderType: "Dine-in",
    table: "T-04",
    time: "12:15 PM",
  },
  {
    id: 1002,
    customer: "Ayesha Malik",
    items: ["Chicken Biryani", "Raita"],
    total: 950,
    status: "Preparing",
    paymentStatus: "Pending",
    orderType: "Dine-in",
    table: "T-02",
    time: "12:22 PM",
  },
  {
    id: 1003,
    customer: "Usman Ali",
    items: ["Pizza", "Garlic Bread"],
    total: 2400,
    status: "Pending",
    paymentStatus: "Pending",
    orderType: "Takeaway",
    table: null,
    time: "12:30 PM",
  },
  {
    id: 1004,
    customer: "Fatima Noor",
    items: ["Pasta Alfredo", "Fresh Juice"],
    total: 1650,
    status: "Completed",
    paymentStatus: "Paid",
    orderType: "Dine-in",
    table: "T-07",
    time: "12:35 PM",
  },
  {
    id: 1005,
    customer: "Bilal Ahmed",
    items: ["Club Sandwich", "Fries"],
    total: 1200,
    status: "Cancelled",
    paymentStatus: "Refunded",
    orderType: "Takeaway",
    table: null,
    time: "12:40 PM",
  },
];




 const weeklyRevenue = [
  { day: "Mon", revenue: 18500, orders: 42 },
  { day: "Tue", revenue: 22300, orders: 51 },
  { day: "Wed", revenue: 19800, orders: 46 },
  { day: "Thu", revenue: 27600, orders: 63 },
  { day: "Fri", revenue: 32400, orders: 78 },
  { day: "Sat", revenue: 41200, orders: 95 },
  { day: "Sun", revenue: 35600, orders: 84 },
];



const popularItems = [
  {
    id: 1,
    name: "Chicken Biryani",
    category: "Main Course",
    totalOrders: 142,
    price: 650,
  },
  {
    id: 2,
    name: "Zinger Burger",
    category: "Fast Food",
    totalOrders: 118,
    price: 550,
  },
  {
    id: 3,
    name: "Chicken Karahi",
    category: "Main Course",
    totalOrders: 96,
    price: 1400,
  },
  {
    id: 4,
    name: "Loaded Fries",
    category: "Snacks",
    totalOrders: 74,
    price: 450,
  },
  {
    id: 5,
    name: "Mint Margarita",
    category: "Beverages",
    totalOrders: 61,
    price: 300,
  },
];


export { dashboardStats, recentOrders, weeklyRevenue, popularItems };