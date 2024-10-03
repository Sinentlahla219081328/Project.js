
const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const PORT = 3000;

const dataFilePath = path.join(__dirname, 'items.json');

async function readData() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading data:', error);
    return [];
  }
}

async function writeData(data) {
  try {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data:', error);
  }
}

const server = http.createServer(async (req, res) => {
  const { method, url } = req;

  console.log(`Received ${method} request for ${url}`);

  // GET method for fetching all items or a specific item by ID
  if (method === 'GET') {
    if (url === '/items') {
      // Fetch all items
      try {
        const items = await readData();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(items));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    } else if (url.startsWith('/items/')) {
      // Fetch specific item by ID
      const id = parseInt(url.split('/')[2], 10); // Extract ID from URL
      try {
        const items = await readData();
        const item = items.find(item => item.id === id);

        if (item) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(item));
        } else {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Item not found.' }));
        }
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal Server Error' }));
      }
    }
  }

  // POST method for adding a new item
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

  // PUT method for updating an item by ID
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

  // DELETE method for deleting an item by ID
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
  } 

  // If no matching route, return 404
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running and listening on http://localhost:${PORT}`);
});
