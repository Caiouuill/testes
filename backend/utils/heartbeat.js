const nodes = require("../config/nodes");
const sendRequest = require("../services/requestService");
const bullyService = require("../services/bullyService");
const websocketService = require("../services/websocketService");

function startHeartbeat(nodeId) {
  setInterval(async () => {
    const coordinator = bullyService.getCoordinator();

    if (!coordinator || coordinator === nodeId) return;

    const leader = nodes.find((n) => n.id === coordinator);

    if (!leader) {
      bullyService.startElection();
      return;
    }

    try {
      await sendRequest(leader, "/ping");
    } catch {
      console.log("Coordenador caiu");
      websocketService.broadcast("coordinator_down", { coordinator });
      bullyService.startElection();
    }
  }, 5000);
}

module.exports = startHeartbeat;
