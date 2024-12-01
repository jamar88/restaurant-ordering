const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // Pro komunikaci s Arduino Cloud

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({
  origin: 'https://jamar88.github.io' // Povolit přístup pouze z GitHub Pages
}));

// Paměťová databáze
const orders = [];
let currentId = 1;

// Přidání objednávky
app.post('/api/orders', (req, res) => {
  const { tableNumber, items } = req.body;
  const order = { id: currentId++, tableNumber, items, status: 'pending' };
  orders.push(order);
  console.log(`Přidána nová objednávka: ${JSON.stringify(order)}`);
  res.status(201).json(order);
});

// Načtení všech objednávek
app.get('/api/orders', (req, res) => {
  console.log('Načítám všechny objednávky');
  res.json(orders);
});

// Aktualizace objednávky
app.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  console.log(`Přijat PATCH požadavek: objednávka ID ${id}, nový stav: ${status}`);

  const order = orders.find(o => o.id === parseInt(id));
  if (!order) {
    console.error(`Objednávka s ID ${id} nenalezena.`);
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  console.log(`Objednávka ID ${id} aktualizována na stav: ${status}`);

  // Arduino Cloud API - aktualizace proměnné
  const ARDUINO_API_KEY = process.env.ARDUINO_API_KEY; // API token uložený jako proměnná prostředí
  const THING_ID = '1abb72c9-2a20-4a7c-ba7d-c9a6353ff304'; // Vložte ID Thing z Arduino Cloud
  const PROPERTY_ID = '395adbdb-b8b9-44cb-a08a-aa9a069e87f3'; // ID proměnné orderStatus

  try {
    const arduinoResponse = await axios.put(
      `https://api2.arduino.cc/iot/v2/things/${THING_ID}/properties/${PROPERTY_ID}`,
      {
        value: `Objednávka ${order.id}: ${status === 'completed' ? 'K výdeji' : status}`,
      },
      {
        headers: {
          Authorization: `Bearer ${ARDUINO_API_KEY}`,
        },
      }
    );

    console.log('Arduino Cloud Response:', arduinoResponse.data);

    // Vrácení aktuálního stavu objednávky klientovi
    res.json({
      message: 'Order updated successfully',
      order: {
        id: order.id,
        tableNumber: order.tableNumber,
        status: order.status,
      }
    });
  } catch (error) {
    console.error('Error updating Arduino Cloud:', error.message);
    res.status(500).json({ error: 'Chyba při aktualizaci Arduino Cloudu' });
  }
});

// Spuštění serveru
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
