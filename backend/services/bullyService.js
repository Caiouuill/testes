const nodes = require("../config/nodes");
const sendRequest = require("./requestService");
const websocketService = require("./websocketService");

let coordinator = null;
const nodeId = parseInt(process.env.ID, 10);

async function startElection() {
  console.log(`Node ${nodeId} iniciou eleição`);
  websocketService.broadcast("election_started", { nodeId });

  const higherNodes = nodes.filter((n) => n.id > nodeId);

  let answered = false;

  for (const node of higherNodes) {
    try {
      await sendRequest(node, "/election", "POST", { from: nodeId });
      answered = true;
    } catch {
      // Ignora falhas para continuar notificando os demais nós.
    }
  }

  if (!answered) {
    becomeCoordinator();
  }
}

async function becomeCoordinator() {
  coordinator = nodeId;

  console.log(`Node ${nodeId} virou coordenador`);
  websocketService.broadcast("coordinator_elected", { coordinator: nodeId });

  for (const node of nodes) {
    if (node.id !== nodeId) {
      try {
        await sendRequest(node, "/coordinator", "POST", { id: nodeId });
      } catch {
        // Ignora falhas para manter o anúncio para os nós disponíveis.
      }
    }
  }
}

function setCoordinator(id) {
  coordinator = id;
}

function getCoordinator() {
  return coordinator;
}

module.exports = {
  startElection,
  becomeCoordinator,
  setCoordinator,
  getCoordinator,
};
