const bullyService = require("../services/bullyService");
const websocketService = require("../services/websocketService");

function handleElection(_req, res, data, nodeId) {
  console.log(`Recebi eleição de ${data.from}`);

  websocketService.broadcast("election_received", {
    from: data.from,
    to: nodeId,
  });

  if (nodeId > data.from) {
    bullyService.startElection();
  }

  res.json({ status: "ok" });
}

function handleCoordinator(_req, res, data, nodeId) {
  bullyService.setCoordinator(data.id);

  websocketService.broadcast("coordinator_updated", {
    coordinator: data.id,
    notifiedNode: nodeId,
  });

  console.log(`Novo coordenador: ${data.id}`);

  res.json({ status: "ok" });
}

module.exports = {
  handleElection,
  handleCoordinator,
};
