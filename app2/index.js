const http = require("http");

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Hello from App2 🔥");
}).listen(3001);
