const http = require("http");

function sendRequest(node, path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;

    const headers = {
      "Content-Type": "application/json",
    };

    if (data) {
      headers["Content-Length"] = Buffer.byteLength(data);
    }

    if (process.env.INTERNAL_API_TOKEN) {
      headers["x-internal-token"] = process.env.INTERNAL_API_TOKEN;
    }

    const options = {
      hostname: node.host,
      port: node.port,
      path,
      method,
      headers,
    };

    const req = http.request(options, () => resolve());

    req.on("error", reject);

    if (data) req.write(data);
    req.end();
  });
}

module.exports = sendRequest;
