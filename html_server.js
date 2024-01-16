const http = require('http');
const fs = require('fs').promises;
const path = require('path');

const hostname = '0.0.0.0';
const port = 8080;

const server = http.createServer(async (req, res) => {
    // Determine the file path based on the request URL
    let filePath = '.' + req.url;

    // Default to serving index.html if the request URL is '/'
    if (filePath === './') {
        filePath = './index.html';
    }

    // Get the file's extension to set the content type
    const extname = String(path.extname(filePath)).toLowerCase();

    // Define content types based on file extensions
	const contentType = {
		'.html': 'text/html',
		'.js': 'application/javascript',
		'.css': 'text/css',
		'.png': 'image/png',
		'.jpeg': 'image/jpeg',
		'.jpg': 'image/jpeg',
		'.mp3': 'audio/mpeg',
		'.ogg': 'audio/ogg',
		'.woff': 'application/font-woff',
		'.woff2': 'application/font-woff2',
		'.ttf': 'font/ttf',
		'.mp4': 'video/mp4',
	};


    try {
        // Check if the requested file exists using fs.promises.access
        await fs.access(filePath);

        // Read the file and serve it with the appropriate content type
        const data = await fs.readFile(filePath);

        res.writeHead(200, { 'Content-Type': contentType[extname] || 'application/octet-stream' });
        res.end(data);
    } catch (err) {
        // If the file does not exist, return a 404 error
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

process.on('SIGINT', () => {
    console.log('\nServer shutting down...');
    server.close(() => {
        console.log('Server has been gracefully terminated.');
        process.exit(0);
    });
});
