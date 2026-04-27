const http = require('http');
const fs = require('fs/promises');
const path = require('path');

const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const PUBLIC_DIR = path.join(__dirname);

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const sendResponse = (res, status, body, contentType = 'text/plain') => {
  res.writeHead(status, { 'Content-Type': contentType });
  res.end(body);
};

const serveStatic = async (req, res) => {
  let requestPath = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (requestPath === '/') requestPath = '/index.html';

  const filePath = path.join(PUBLIC_DIR, requestPath);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendResponse(res, 403, 'Forbidden');
    return;
  }

  try {
    const file = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    sendResponse(res, 200, file, contentType);
  } catch (error) {
    sendResponse(res, 404, 'Not Found');
  }
};

const handleApiRequest = async (req, res) => {
  if (req.method !== 'POST') {
    sendResponse(res, 405, 'Method Not Allowed');
    return;
  }

  if (!OPENAI_API_KEY) {
    sendResponse(res, 500, JSON.stringify({ error: 'OpenAI API key not configured.' }), 'application/json');
    return;
  }

  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }

  try {
    const payload = JSON.parse(body);
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.text();
    res.writeHead(response.status, { 'Content-Type': 'application/json' });
    res.end(data);
  } catch (error) {
    sendResponse(res, 500, JSON.stringify({ error: error.message }), 'application/json');
  }
};

const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/openai')) {
    handleApiRequest(req, res);
    return;
  }
  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Makro AI Assistant server running at http://localhost:${PORT}`);
  if (!OPENAI_API_KEY) {
    console.warn('Warning: OPENAI_API_KEY is not set. Set it in a .env file or environment variable.');
  }
});
