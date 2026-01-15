// ===============================
// GESTIONE TURNI
// ===============================

const TURN_ORDER = ["me", "ai1", "ai2"];

function getNextPlayer(player) {
  const idx = TURN_ORDER.indexOf(player);
  return TURN_ORDER[(idx + 1) % 3];
}

function chooseRandomDealer() {
  GAME_STATE.dealer = TURN_ORDER[Math.floor(Math.random() * 3)];
}

function rotateDealer() {
  GAME_STATE.dealer = getNextPlayer(GAME_STATE.dealer);
}

function setStarterPlayer() {
  GAME_STATE.currentPlayer = getNextPlayer(GAME_STATE.dealer);
}
