const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Pro komunikaci s Arduino Cloud

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors());

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
app.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const order = orders.find(o => o.id === parseInt(id));
  if (!order) return res.status(404).send('Order not found');

  order.status = 'completed';

  // Arduino Cloud API - aktualizace proměnné
  const ARDUINO_API_KEY = process.env.ARDUINO_API_KEY; // API token uložený jako proměnná prostředí
  const THING_ID = '26261baf-48b7-4bf1-9060-bd5bd0e983d9'; // Vložte ID Thing z Arduino Cloud
  const PROPERTY_ID = '59f3cbcd-7b39-43c6-8c2a-ce5a92893fc9'; // ID proměnné orderStatus

  try {
    const response = await axios.put(
      `https://api2.arduino.cc/iot/v2/things/${THING_ID}/properties/${PROPERTY_ID}`,
      {
        value: `Objednávka ${order.id} hotová`,
      },
      {
        headers: {
          Authorization: `Bearer ${ARDUINO_API_KEY}`,
        },
      }
    );

    console.log('Arduino Cloud Response:', response.data);
    res.send('Order status updated and Arduino Cloud notified');
  } catch (error) {
    console.error('Error updating Arduino Cloud:', error.message);
    res.status(500).send('Chyba při aktualizaci Arduino Cloudu');
  }
});

// Spuštění serveru
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
