const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Paměťová databáze
const orders = [];
let currentId = 1;

// Přidání objednávky
app.post('/api/orders', (req, res) => {
  const { tableNumber, items } = req.body;
  const order = { id: currentId++, tableNumber, items, status: 'pending' };
  orders.push(order);
  res.status(201).json(order);
});

// Načtení všech objednávek
app.get('/api/orders', (req, res) => {
  res.json(orders);
});

// Aktualizace objednávky
const axios = require('axios');

app.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === parseInt(id));
  if (!order) return res.status(404).send('Order not found');

  order.status = 'completed';

  // Aktualizace Arduino Cloudu
  try {
    await axios.put('https://api2.arduino.cc/iot/v2/things/<thingId>/properties/<propertyId>', {
      value: `Objednávka ${order.id} hotová`,
    }, {
      headers: {
        Authorization: `Bearer <your-access-token>`,
      },
    });

    res.send('Order status updated and Arduino Cloud notified');
  } catch (error) {
    res.status(500).send('Chyba při aktualizaci Arduino Cloudu');
  }
});

// Spuštění serveru
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
