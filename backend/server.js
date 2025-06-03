const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const wss = new WebSocket.Server({ server });

const PORT = 8080;

const generateStockData = () => {
  const stocks = [];
  
  for (let id = 1; id <= 5000; id++) {
    const basePrice = Math.random() * 1000 + 10;
    
    stocks.push({
      id,
      last: parseFloat(basePrice.toFixed(2)),
      high: parseFloat((basePrice * (1 + Math.random() * 0.1)).toFixed(2)),
      low: parseFloat((basePrice * (1 - Math.random() * 0.1)).toFixed(2)),
      change: parseFloat((Math.random() * 10 - 5).toFixed(2)),
      volume: Math.floor(Math.random() * 10000000),
      price: parseFloat(basePrice.toFixed(2))
    });
  }
  
  return stocks;
};

let stocksData = generateStockData();

const updateStockData = () => {
  // const randomIndex = Math.floor(Math.random() * stocksData.length);
  // const randomStock = stocksData[randomIndex];
  // const changePercent = (Math.random() * 4 - 2) / 100;

  // const newPrice = parseFloat((randomStock.price * (1 + changePercent)).toFixed(2));

  // const newHigh = Math.max(randomStock.high, newPrice);
  // const newLow = Math.min(randomStock.low, newPrice);
  // const newChange = parseFloat((newPrice - randomStock.last).toFixed(2));
  // const newVolume = randomStock.volume + Math.floor(Math.random() * 100000);
  // const newLast = randomStock.price;
  // stocksData[randomIndex] = {
  //   ...randomStock,
  //   high: newHigh,
  //   low: newLow,
  //   change: newChange,
  //   volume: newVolume,
  //   price: newPrice,
  //   last: newLast
  // }
  // return stocksData;

  
  stocksData = stocksData.map(stock => {
    const changePercent = (Math.random() * 4 - 2) / 100;
    
    const newPrice = parseFloat((stock.price * (1 + changePercent)).toFixed(2));
    
    const newHigh = Math.max(stock.high, newPrice);
    const newLow = Math.min(stock.low, newPrice);
    const newChange = parseFloat((newPrice - stock.last).toFixed(2));
    const newVolume = stock.volume + Math.floor(Math.random() * 100000);
    const newLast = stock.price;
    
    return {
      ...stock,
      high: newHigh,
      low: newLow,
      change: newChange,
      volume: newVolume,
      price: newPrice,
      last: newLast
    };
  });
};

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.send(JSON.stringify(stocksData));
  
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});


setInterval(() => {
  updateStockData();
  
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(stocksData));
    }
  });
}, 100);

app.get('/', (req, res) => {
  res.send('Stock WebSocket Server is running');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});