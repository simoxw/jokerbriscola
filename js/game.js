// ===============================
// MOTORE PRINCIPALE DEL GIOCO
// ===============================

function startMatch() {
  startSingleGame();
}

function startSingleGame() {
  GAME_STATE.jokerPlayer = null;
  GAME_STATE.tricksWon = { me: [], ai1: [], ai2: [] };
  GAME_STATE.currentTrick = { starter: null, cards: { me: null, ai1: null, ai2: null } };
  GAME_STATE.trickHistory = [];

  clearAllJokers();

  GAME_STATE.deck = createFullDeck();
  removeRandomTwo(GAME_STATE.deck);
  shuffle(GAME_STATE.deck);

  dealInitialHands();

  GAME_STATE.briscolaCard = GAME_STATE.deck.pop();
  GAME_STATE.briscolaSuit = GAME_STATE.briscolaCard.suit;

  GAME_STATE.currentTrick.starter = "me";
  GAME_STATE.currentPlayer = "me";

  GAME_STATE.inputLocked = false;

  renderUI();
}

function playerPlaysCard(card) {
  playCard("me", card);
}

// ===============================
// PATCH APPLICATA QUI
// ===============================

function playCard(player, card) {
  const hand = GAME_STATE.hands[player];
  const idx = hand.indexOf(card);
  if (idx !== -1) hand.splice(idx, 1);

  GAME_STATE.currentTrick.cards[player] = card;

  if (player === "me") {
    GAME_STATE.inputLocked = true;
  }

  if (!GAME_STATE.jokerPlayer && card.suit === GAME_STATE.briscolaSuit) {
    GAME_STATE.jokerPlayer = player;
    revealJokerUI(player);
  }

  const played = GAME_STATE.currentTrick.cards;

  if (played.me && played.ai1 && played.ai2) {
    GAME_STATE.currentPlayer = null;
    renderUI();
    resolveTrick();
    return;
  }

  GAME_STATE.currentPlayer = getNextPlayer(player);
  renderUI();

  if (GAME_STATE.currentPlayer !== "me") {
    const aiCard = aiChooseCard(GAME_STATE.currentPlayer);
    setTimeout(() => playCard(GAME_STATE.currentPlayer, aiCard), 600);
  }
}

// ===============================
// RISOLUZIONE PRESA
// ===============================

function resolveTrick() {
  const winner = evaluateTrick();

  highlightWinnerCard(winner);

  const played = GAME_STATE.currentTrick.cards;

  GAME_STATE.tricksWon[winner].push(played.me, played.ai1, played.ai2);

  const scores = calculateSingleGameScores();
  GAME_STATE.trickHistory.push({
    winner: winner,
    cards: { ...played },
    scores: { ...scores }
  });

  const btn = document.getElementById("nextHandBtn");
  btn.style.display = "inline-block";
  btn.onclick = advanceToNextHand;
}

// 🔥 MODIFICATO: highlight persistente
function highlightWinnerCard(winner) {
  const slot = document.getElementById(`played-${winner}`);
  slot.classList.add("winner-highlight");
}

function advanceToNextHand() {
  document.getElementById("nextHandBtn").style.display = "none";

  // 🔥 Rimuove highlight persistente della presa precedente
  document.getElementById("played-me").classList.remove("winner-highlight");
  document.getElementById("played-ai1").classList.remove("winner-highlight");
  document.getElementById("played-ai2").classList.remove("winner-highlight");

  const order = getTrickOrder();

  for (let i = 0; i < order.length; i++) {
    const player = order[i];

    if (GAME_STATE.deck.length > 0) {
      const card = GAME_STATE.deck.shift();
      GAME_STATE.hands[player].push(card);
    }
    else if (GAME_STATE.deck.length === 0 && GAME_STATE.briscolaCard) {
      GAME_STATE.hands[player].push(GAME_STATE.briscolaCard);
      GAME_STATE.briscolaCard = null;
    }
  }

  GAME_STATE.currentTrick = {
    starter: order[0],
    cards: { me: null, ai1: null, ai2: null }
  };

  GAME_STATE.currentPlayer = order[0];
  GAME_STATE.inputLocked = false;

  renderUI();

  if (checkEndOfSingleGame()) return;

  if (GAME_STATE.currentPlayer !== "me") {
    const aiCard = aiChooseCard(GAME_STATE.currentPlayer);
    setTimeout(() => playCard(GAME_STATE.currentPlayer, aiCard), 600);
  }
}

function getTrickOrder() {
  const winner = evaluateTrick();
  const idx = TURN_ORDER.indexOf(winner);

  return [
    TURN_ORDER[idx],
    TURN_ORDER[(idx + 1) % 3],
    TURN_ORDER[(idx + 2) % 3]
  ];
}

// ===============================
// FINE PARTITA SINGOLA
// ===============================

function checkEndOfSingleGame() {
  const noCardsInHands =
    GAME_STATE.hands.me.length === 0 &&
    GAME_STATE.hands.ai1.length === 0 &&
    GAME_STATE.hands.ai2.length === 0;

  const noCardsInDeck = GAME_STATE.deck.length === 0 && !GAME_STATE.briscolaCard;

  if (noCardsInHands && noCardsInDeck) {
    endSingleGame();
    return true;
  }

  return false;
}

function endSingleGame() {
  const scores = calculateSingleGameScores();
  const result = determineSingleGameWinner(scores);

  let message = "";

  if (result === "joker") {
    message = `Il Joker (${GAME_STATE.jokerPlayer}) ha vinto!`;
    GAME_STATE.matchScore[GAME_STATE.jokerPlayer] += 2;
  } else if (result === "allies") {
    const allies = TURN_ORDER.filter(p => p !== GAME_STATE.jokerPlayer);
    message = `Gli alleati (${allies.join(" + ")}) hanno vinto!`;
    GAME_STATE.matchScore[allies[0]] += 1;
    GAME_STATE.matchScore[allies[1]] += 1;
  } else {
    message = "Pareggio tecnico.";
  }

  renderUI();

  if (checkEndOfMatch()) return;

  showEndSingleGamePanel(message, scores);
}

function startNextSingleGame() {
  startSingleGame();
}

// ===============================
// FINE PARTITA GENERALE
// ===============================

function checkEndOfMatch() {
  for (const p of TURN_ORDER) {
    if (GAME_STATE.matchScore[p] >= 10) {
      showEndMatchPanel(p);
      return true;
    }
  }
  return false;
}

function showEndMatchPanel(winner) {
  const panel = document.createElement("div");
  panel.style.position = "fixed";
  panel.style.top = "0";
  panel.style.left = "0";
  panel.style.width = "100%";
  panel.style.height = "100%";
  panel.style.background = "rgba(0,0,0,0.8)";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.justifyContent = "center";
  panel.style.alignItems = "center";
  panel.style.color = "white";
  panel.style.fontSize = "1.5rem";
  panel.style.zIndex = "9999";

  panel.innerHTML = `
    <div style="background:#0f4f2e; padding:25px; border-radius:12px; text-align:center;">
      <h2>Partita Generale Conclusa</h2>
      <p>Ha vinto: <strong>${winner}</strong></p>
      <button id="restartMatchBtn" style="margin-top:20px; padding:10px 20px; border:none; border-radius:6px; background:#e0a800; color:#1b1202; font-weight:bold; cursor:pointer;">
        Nuova Partita Generale
      </button>
    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById("restartMatchBtn").onclick = () => {
    document.body.removeChild(panel);
    GAME_STATE.matchScore = { me: 0, ai1: 0, ai2: 0 };
    GAME_STATE.jokerPlayer = null;
    clearAllJokers();
    startMatch();
  };
}

// ===============================
// RESET PARTITA (PULSANTE ESTERNO)
// ===============================

function resetMatch() {
  const conferma = confirm("Vuoi davvero ricominciare la partita da capo?");

  if (!conferma) return;

  GAME_STATE.matchScore = { me: 0, ai1: 0, ai2: 0 };
  GAME_STATE.jokerPlayer = null;
  GAME_STATE.trickHistory = [];
  GAME_STATE.tricksWon = { me: [], ai1: [], ai2: [] };
  GAME_STATE.currentTrick = { starter: null, cards: { me: null, ai1: null, ai2: null } };

  clearAllJokers();
  startMatch();
}
