// Import the required modules
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

// Define the port number
const PORT = 3000;

// Define the path to the JSON file that acts as the database
const dataFilePath = path.join(__dirname, 'items.json');

// Utility function to read data from the JSON file
async function readData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
}

// Utility function to write data to the JSON file
async function writeData(data) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

// Create the server
const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  console.log(`Received ${method} request for ${url}`);

  // Handle the GET /items route to fetch items from the JSON file
  if (url === '/items' && method === 'GET') {
    try {
      const items = await readData();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(items));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  }
  // Handle the POST /items route to add a new item
  else if (url === '/items' && method === 'POST') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const newItem = JSON.parse(body);

        if (!newItem.name || !newItem.description) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Name and description are required.' }));
        }

        const items = await readData();
        newItem.id = items.length + 1;
        items.push(newItem);
        await writeData(items);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newItem));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON format.' }));
      }
    });
  }
  // Handle the PUT /items/:id route to update an existing item
  else if (url.startsWith('/items/') && method === 'PUT') {
    const id = parseInt(url.split('/')[2], 10);
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', async () => {
      try {
        const updatedItem = JSON.parse(body);
        const items = await readData();
        const itemIndex = items.findIndex(item => item.id === id);

        if (itemIndex === -1) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Item not found.' }));
        }

        if (!updatedItem.name || !updatedItem.description) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Name and description are required.' }));
        }

        items[itemIndex] = { ...items[itemIndex], ...updatedItem };
        await writeData(items);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(items[itemIndex]));
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON format.' }));
      }
    });
  }
  // Handle the DELETE /items/:id route to delete an existing item
  else if (url.startsWith('/items/') && method === 'DELETE') {
    const id = parseInt(url.split('/')[2], 10);
    try {
      const items = await readData();
      const itemIndex = items.findIndex(item => item.id === id);

      if (itemIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Item not found.' }));
      }

      items.splice(itemIndex, 1);
      await writeData(items);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ message: 'Item deleted successfully.' }));
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

// Start the server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server is running and listening on http://localhost:${PORT}`);
});
