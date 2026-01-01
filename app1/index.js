const http = require("http");

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Hello from App1 🚀");
}).listen(3000);
