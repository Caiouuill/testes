function requestLogger(req, res, next) {
  const startedAt = Date.now();
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });

  next();
}

function requireInternalToken(req, res, next) {
  const configuredToken = process.env.INTERNAL_API_TOKEN;

  if (!configuredToken) {
    next();
    return;
  }

  const token = req.headers["x-internal-token"];

  if (token !== configuredToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}

module.exports = {
  requestLogger,
  requireInternalToken,
};
