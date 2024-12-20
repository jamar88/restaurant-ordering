const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const orders = [];
let currentId = 1;

app.post('/api/orders', (req, res) => {
  const { tableNumber, items } = req.body;
  const order = { id: currentId++, tableNumber, items, status: 'pending' };
  orders.push(order);
  res.status(201).json(order);
});

app.get('/api/orders', (req, res) => {
  res.json(orders);
});

app.patch('/api/orders/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const order = orders.find(o => o.id === parseInt(id));
  if (!order) return res.status(404).send('Order not found');
  order.status = status;
  res.send(order);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
