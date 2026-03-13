const crypto = require("crypto");

const sockets = new Set();

function initialize(server, nodeId) {
  server.on("upgrade", (req, socket) => {
    if (req.url !== "/ws") {
      socket.destroy();
      return;
    }

    const webSocketKey = req.headers["sec-websocket-key"];

    if (!webSocketKey) {
      socket.destroy();
      return;
    }

    const acceptKey = generateAcceptValue(webSocketKey);

    const headers = [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptKey}`,
      "\r\n",
    ];

    socket.write(headers.join("\r\n"));
    sockets.add(socket);

    socket.on("close", () => sockets.delete(socket));
    socket.on("end", () => sockets.delete(socket));
    socket.on("error", () => sockets.delete(socket));

    send(socket, {
      event: "connection",
      message: `Conectado ao node ${nodeId}`,
      nodeId,
      timestamp: new Date().toISOString(),
    });
  });
}

function broadcast(event, payload = {}) {
  const data = {
    event,
    ...payload,
    timestamp: new Date().toISOString(),
  };

  sockets.forEach((socket) => send(socket, data));
}

function send(socket, data) {
  if (socket.destroyed || !socket.writable) {
    sockets.delete(socket);
    return;
  }

  const json = JSON.stringify(data);
  const payloadLength = Buffer.byteLength(json);
  const frame = createTextFrame(json, payloadLength);

  try {
    socket.write(frame);
  } catch {
    sockets.delete(socket);
  }
}

function createTextFrame(payload, payloadLength) {
  if (payloadLength < 126) {
    const frame = Buffer.alloc(2 + payloadLength);
    frame[0] = 0x81;
    frame[1] = payloadLength;
    frame.write(payload, 2);
    return frame;
  }

  if (payloadLength < 65536) {
    const frame = Buffer.alloc(4 + payloadLength);
    frame[0] = 0x81;
    frame[1] = 126;
    frame.writeUInt16BE(payloadLength, 2);
    frame.write(payload, 4);
    return frame;
  }

  throw new Error("Payload de websocket excedeu o tamanho suportado");
}

function generateAcceptValue(webSocketKey) {
  return crypto
    .createHash("sha1")
    .update(`${webSocketKey}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`, "binary")
    .digest("base64");
}

module.exports = {
  initialize,
  broadcast,
};
