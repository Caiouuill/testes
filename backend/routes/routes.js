const express = require("express");
const electionController = require("../controllers/electionController");
const bullyService = require("../services/bullyService");
const { requireInternalToken } = require("../middleware/requestMiddleware");

function createRouter(nodeId) {
  const router = express.Router();

  router.get("/ping", (_req, res) => {
    res.send("ok");
  });

  router.get("/status", (_req, res) => {
    res.json({
      nodeId,
      coordinator: bullyService.getCoordinator(),
    });
  });

  router.post("/election", requireInternalToken, (req, res) => {
    electionController.handleElection(req, res, req.body, nodeId);
  });

  router.post("/coordinator", requireInternalToken, (req, res) => {
    electionController.handleCoordinator(req, res, req.body, nodeId);
  });

  return router;
}

module.exports = createRouter;
