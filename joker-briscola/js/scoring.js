// ===============================
// GESTIONE PUNTEGGI
// ===============================

// LOGICA DI PRESA CORRETTA PER BRISCOLA
function evaluateTrick() {
  const played = GAME_STATE.currentTrick.cards;
  const starter = GAME_STATE.currentTrick.starter;
  const briscola = GAME_STATE.briscolaSuit.toLowerCase();

  const semeDiMano = played[starter].suit.toLowerCase();

  let winner = starter;
  let winningCard = played[starter];

  for (const player of TURN_ORDER) {
    const card = played[player];
    if (!card) continue;

    const suit = card.suit.toLowerCase();
    const isBriscola = suit === briscola;
    const winningIsBriscola = winningCard.suit.toLowerCase() === briscola;

    // 1) Se solo uno gioca briscola → vince lui
    if (isBriscola && !winningIsBriscola) {
      winner = player;
      winningCard = card;
      continue;
    }

    // 2) Se entrambi giocano briscola → vince la più alta (order)
    if (isBriscola && winningIsBriscola) {
      if (card.order > winningCard.order) {
        winner = player;
        winningCard = card;
      }
      continue;
    }

    // ⚠ Da qui in poi gestiamo SOLO carte NON briscola
    if (isBriscola || winningIsBriscola) {
      // Se una delle due è briscola, abbiamo già deciso sopra
      continue;
    }

    // 3) Nessuna briscola: si gioca sul seme di mano
    const followsMano = suit === semeDiMano;
    const winningFollowsMano = winningCard.suit.toLowerCase() === semeDiMano;

    // Se solo uno segue il seme di mano → vince lui
    if (followsMano && !winningFollowsMano) {
      winner = player;
      winningCard = card;
      continue;
    }

    // Se entrambi seguono il seme di mano → vince la più alta (order)
    if (followsMano && winningFollowsMano) {
      if (card.order > winningCard.order) {
        winner = player;
        winningCard = card;
      }
      continue;
    }

    // 4) Altri semi → non possono vincere
  }

  return winner;
}

// ===============================
// CALCOLO PUNTI
// ===============================

function calculateSingleGameScores() {
  const scores = { me: 0, ai1: 0, ai2: 0 };

  for (const player of TURN_ORDER) {
    for (const card of GAME_STATE.tricksWon[player]) {
      scores[player] += card.points;
    }
  }

  return scores;
}

// ===============================
// DETERMINA VINCITORE PARTITA SINGOLA
// ===============================

function determineSingleGameWinner(scores) {
  const joker = GAME_STATE.jokerPlayer;
  const allies = TURN_ORDER.filter(p => p !== joker);

  if (scores[joker] >= JOKER_MIN_POINTS) return "joker";
  if (scores[allies[0]] + scores[allies[1]] >= ALLIES_MIN_POINTS) return "allies";
  return "null";
}
