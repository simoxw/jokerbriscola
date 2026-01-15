// ===============================
// INTELLIGENZA ARTIFICIALE PREMIUM
// ===============================

// Modalità disponibili: "intermediate", "hard"
window.AI_DIFFICULTY = window.AI_DIFFICULTY || "intermediate";

function aiChooseCard(player) {
  const hand = GAME_STATE.hands[player];

  if (AI_DIFFICULTY === "intermediate") {
    return aiIntermediate(hand, player);
  } else {
    return aiPro(hand, player);
  }
}

// ===============================
// UTILITY COMUNI
// ===============================

function getCurrentStarter() {
  return GAME_STATE.currentTrick.starter;
}

function getCurrentTrickCards() {
  return GAME_STATE.currentTrick.cards;
}

function getBriscolaSuit() {
  return GAME_STATE.briscolaSuit;
}

function getRole(player) {
  const joker = GAME_STATE.jokerPlayer;
  if (!joker) return "none";
  if (player === joker) return "joker";
  return "ally";
}

function getTrickValue() {
  const played = GAME_STATE.currentTrick.cards;
  let total = 0;
  for (const p of ["me", "ai1", "ai2"]) {
    if (played[p]) total += played[p].points;
  }
  return total;
}

function getPositionInTrick(player) {
  const starter = getCurrentStarter();
  const order = TURN_ORDER;
  const idxStarter = order.indexOf(starter);
  const sequence = [
    order[idxStarter],
    order[(idxStarter + 1) % 3],
    order[(idxStarter + 2) % 3]
  ];

  let countPlayedBefore = 0;
  for (const p of sequence) {
    if (p === player) break;
    if (GAME_STATE.currentTrick.cards[p]) countPlayedBefore++;
  }
  return countPlayedBefore; // 0 = primo, 1 = secondo, 2 = terzo
}

function getPlayableCards(hand, player) {
  const trick = getCurrentTrickCards();
  const starter = getCurrentStarter();
  const starterCard = trick[starter];

  const isFirst =
    !trick.me && !trick.ai1 && !trick.ai2;

  if (isFirst) return hand.slice();

  const semeDiMano = starterCard.suit;
  const sameSuit = hand.filter(c => c.suit === semeDiMano);

  if (sameSuit.length > 0) return sameSuit;

  return hand.slice();
}

function sortByOrderAsc(cards) {
  return cards.slice().sort((a, b) => a.order - b.order);
}

function sortByOrderDesc(cards) {
  return cards.slice().sort((a, b) => b.order - a.order);
}

function sortByPointsThenOrderAsc(cards) {
  return cards.slice().sort((a, b) => {
    if (a.points !== b.points) return a.points - b.points;
    return a.order - b.order;
  });
}

function sortByPointsThenOrderDesc(cards) {
  return cards.slice().sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.order - a.order;
  });
}

// ===============================
// IA INTERMEDIA (REGOLISTICA)
// ===============================
//
// - Segue sempre il seme se può
// - Taglia solo se conviene
// - Non spreca briscole alte su prese vuote
// - Scarta la carta peggiore quando non può vincere
//
// ===============================

function aiIntermediate(hand, player) {
  const trick = getCurrentTrickCards();
  const briscola = getBriscolaSuit();
  const position = getPositionInTrick(player);
  const playable = getPlayableCards(hand, player);
  const trickValue = getTrickValue();

  const starter = getCurrentStarter();
  const starterCard = trick[starter];
  const semeDiMano = starterCard ? starterCard.suit : null;

  // PRIMO DI MANO
  if (position === 0) {
    const nonBriscola = playable.filter(c => c.suit !== briscola);
    const scarti = nonBriscola.filter(c => c.points === 0);

    if (scarti.length > 0) return sortByOrderAsc(scarti)[0];
    if (nonBriscola.length > 0) return sortByOrderAsc(nonBriscola)[0];

    return sortByOrderAsc(playable)[0];
  }

  // SECONDO O TERZO
  const canWinWith = playable.filter(c => wouldWinTrickWith(c, player));

  if (canWinWith.length === 0) {
    const nonBriscola = playable.filter(c => c.suit !== briscola);
    const scarti = nonBriscola.filter(c => c.points === 0);

    if (scarti.length > 0) return sortByOrderAsc(scarti)[0];
    if (nonBriscola.length > 0) return sortByPointsThenOrderAsc(nonBriscola)[0];

    return sortByPointsThenOrderAsc(playable)[0];
  }

  if (trickValue === 0) {
    return sortByOrderAsc(canWinWith)[0];
  }

  return sortByOrderAsc(canWinWith)[0];
}

function simulateCurrentWinner() {
  return evaluateTrick();
}

function wouldWinTrickWith(card, player) {
  const saved = { ...GAME_STATE.currentTrick.cards };
  const prev = GAME_STATE.currentTrick.cards[player];

  GAME_STATE.currentTrick.cards[player] = card;
  const winner = evaluateTrick();

  GAME_STATE.currentTrick.cards[player] = prev;

  return winner === player;
}
// ===============================
// IA PROFESSIONALE (HARD)
// ===============================
//
// - Tutto ciò che fa l'intermedia, ma meglio
// - Tiene conto del ruolo (joker / alleato / nessuno)
// - Tiene memoria delle briscole e delle carte alte uscite
// - Gioca diversamente da primo, secondo, terzo
// - Evita di diventare Joker per sbaglio
// - Aiuta il compagno se è alleato
// - Forza prese importanti se è Joker
//
// ===============================

function aiPro(hand, player) {
  const role = getRole(player);
  const briscola = getBriscolaSuit();
  const position = getPositionInTrick(player);
  const playable = getPlayableCards(hand, player);
  const trickValue = getTrickValue();
  const memory = buildMemory();

  const evaluations = playable.map(card => ({
    card,
    score: evaluateProCard(card, player, role, position, trickValue, memory, briscola)
  }));

  evaluations.sort((a, b) => b.score - a.score);

  return evaluations[0].card;
}

// Memoria semplice: quante briscole e carte alte sono uscite
function buildMemory() {
  const briscola = getBriscolaSuit();
  let briscoleUscite = 0;
  let assiTreUsciti = 0;

  for (const p of ["me", "ai1", "ai2"]) {
    for (const c of GAME_STATE.tricksWon[p]) {
      if (c.suit === briscola) briscoleUscite++;
      if (c.points >= 10) assiTreUsciti++;
    }
  }

  const trick = getCurrentTrickCards();
  for (const p of ["me", "ai1", "ai2"]) {
    const c = trick[p];
    if (!c) continue;
    if (c.suit === briscola) briscoleUscite++;
    if (c.points >= 10) assiTreUsciti++;
  }

  return {
    briscoleUscite,
    assiTreUsciti
  };
}

function evaluateProCard(card, player, role, position, trickValue, memory, briscola) {
  let score = 0;
  const isBriscola = card.suit === briscola;

  // 1) Valore intrinseco
  score += card.points * 5;
  score += card.order * 1.5;

  // 2) Briscola
  if (isBriscola) score += 12;

  // 3) Memoria: se sono uscite molte briscole, quelle rimaste valgono di più
  score += memory.briscoleUscite * 1.5;

  // 4) Impatto della posizione
  score += evaluatePositionImpact(card, position, trickValue, isBriscola);

  // 5) Ruolo
  if (role === "joker") {
    score += evaluateAsJokerPro(card, trickValue, isBriscola);
  } else if (role === "ally") {
    score += evaluateAsAllyPro(card, player, isBriscola);
  } else {
    score += evaluateAsNeutralPro(card, position, trickValue, isBriscola);
  }

  // 6) Non sprecare briscole alte su prese vuote
  if (isBriscola && card.order >= 8 && trickValue === 0) {
    score -= 25;
  }

  // 7) Se con questa carta non può vincere, penalizza
  if (!wouldWinTrickWith(card, player)) {
    if (card.points > 0) score -= 30;
    else score -= 10;
  }

  return score;
}

function evaluatePositionImpact(card, position, trickValue, isBriscola) {
  let s = 0;

  // Primo di mano: meglio non buttare punti
  if (position === 0) {
    if (card.points > 0) s -= 10;
    if (!isBriscola && card.points === 0 && card.order <= 3) s += 8;
  }

  // Terzo: ha più informazione, può forzare prese importanti
  if (position === 2 && trickValue >= 10) {
    s += 10;
  }

  return s;
}

// Joker: vuole punti, ma non sprecare briscole alte su prese vuote
function evaluateAsJokerPro(card, trickValue, isBriscola) {
  let s = 0;

  s += card.points * 4;

  if (isBriscola && card.order >= 8 && trickValue === 0) {
    s -= 20;
  }

  if (trickValue >= 10 && isBriscola) {
    s += 10;
  }

  return s;
}

// Alleato: non deve superare il compagno se sta già vincendo
function evaluateAsAllyPro(card, player, isBriscola) {
  let s = 0;

  const trick = getCurrentTrickCards();
  const currentWinner = simulateCurrentWinner();
  const joker = GAME_STATE.jokerPlayer;

  if (!joker) return s;

  const allies = TURN_ORDER.filter(p => p !== joker);
  const myAlly = allies.find(p => p !== player);

  if (currentWinner === myAlly) {
    if (isBriscola) s -= 25;
    if (card.points > 0) s -= 10;
  }

  if (currentWinner === joker) {
    if (isBriscola) s += 20;
    if (card.points > 0) s += 10;
  }

  return s;
}

// Neutrale: prima che il Joker sia definito
function evaluateAsNeutralPro(card, position, trickValue, isBriscola) {
  let s = 0;

  if (position === 0 && isBriscola && trickValue === 0) {
    s -= 30;
  }

  return s;
}
