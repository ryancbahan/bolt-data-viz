import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const server = createServer(async (req, res) => {
  try {
    let filePath = req.url === '/' ? '/index.html' : req.url;
    filePath = join(__dirname, filePath);

    const content = await readFile(filePath);
    
    const contentType = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'text/javascript',
    }[filePath.substring(filePath.lastIndexOf('.'))] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(content);
  } catch (err) {
    res.writeHead(404);
    res.end('File not found');
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000/');
});