const http = require("http");
const express = require("express");

const createRouter = require("../routes/routes");
const startHeartbeat = require("../utils/heartbeat");
const { requestLogger } = require("../middleware/requestMiddleware");
const websocketService = require("../services/websocketService");

const nodeId = parseInt(process.env.ID, 10) || 1;
const port = process.env.PORT || 3000;

const app = express();

app.use(express.json());
app.use(requestLogger);
app.use(createRouter(nodeId));

app.get("/", (_req, res) => {
  res.status(200).type("text/plain").send(`Servidor do node ${nodeId}\n`);
});

const server = http.createServer(app);
websocketService.initialize(server, nodeId);

server.listen(port, () => {
  console.log(`Node ${nodeId} rodando na porta ${port}`);
  startHeartbeat(nodeId);
});
