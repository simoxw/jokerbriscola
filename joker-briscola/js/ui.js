// ===============================
// GESTIONE UI
// ===============================

function renderUI() {
  renderPlayerHand();
  renderOpponentCounters();
  renderDeckCount();
  renderBriscola();
  renderPlayedTrick();
  renderMatchScore();
  renderHandScore();
}

// Render mano del giocatore
function renderPlayerHand() {
  const row = document.getElementById("me");
  row.innerHTML = "";

  const isMyTurn = GAME_STATE.currentPlayer === "me";

  row.style.opacity = isMyTurn ? "1" : "0.5";
  row.style.pointerEvents = isMyTurn ? "auto" : "none";

  for (const card of GAME_STATE.hands.me) {
    const el = renderCardImage(card);

    if (isMyTurn) {
      el.classList.add("clickable");
      el.onclick = () => playerPlaysCard(card);
    }

    row.appendChild(el);
  }
}

// Render contatori avversari
function renderOpponentCounters() {
  document.getElementById("ai1").textContent = `🂠 x${GAME_STATE.hands.ai1.length}`;
  document.getElementById("ai2").textContent = `🂠 x${GAME_STATE.hands.ai2.length}`;
}

// Render conteggio mazzo
function renderDeckCount() {
  document.getElementById("deckCount").textContent = `Mazzo: ${GAME_STATE.deck.length}`;
}

// Render briscola
function renderBriscola() {
  const slot = document.getElementById("briscola");
  slot.innerHTML = "";

  if (GAME_STATE.briscolaCard) {
    slot.appendChild(renderCardImage(GAME_STATE.briscolaCard));
  }
}

// Render carte giocate
function renderPlayedTrick() {
  const played = GAME_STATE.currentTrick.cards;

  const slots = {
    me: document.getElementById("played-me"),
    ai1: document.getElementById("played-ai1"),
    ai2: document.getElementById("played-ai2")
  };

  for (const p of TURN_ORDER) {
    slots[p].innerHTML = "";
    if (played[p]) slots[p].appendChild(renderCardImage(played[p]));
  }
}

// Render punteggio generale
function renderMatchScore() {
  document.getElementById("score-me").textContent = GAME_STATE.matchScore.me;
  document.getElementById("score-ai1").textContent = GAME_STATE.matchScore.ai1;
  document.getElementById("score-ai2").textContent = GAME_STATE.matchScore.ai2;
}

// Render punteggio progressivo della mano
function renderHandScore() {
  const scores = calculateSingleGameScores();
  document.getElementById("hand-me").textContent = scores.me;
  document.getElementById("hand-ai1").textContent = scores.ai1;
  document.getElementById("hand-ai2").textContent = scores.ai2;
}

// Crea elemento DOM per una carta
function renderCardImage(card) {
  const wrapper = document.createElement("div");
  wrapper.classList.add("card", "card-image");

  const img = document.createElement("img");
  img.classList.add("card-img");
  img.src = `assets/cards/${card.suit}/${card.file}.png`;
  img.alt = describeCard(card);

  wrapper.appendChild(img);
  return wrapper;
}

// ===============================
// PANNELLO FINE PARTITA SINGOLA
// ===============================

function showEndSingleGamePanel(message, scores) {
  const panel = document.createElement("div");
  panel.id = "endGamePanel";
  panel.style.position = "fixed";
  panel.style.top = "0";
  panel.style.left = "0";
  panel.style.width = "100%";
  panel.style.height = "100%";
  panel.style.background = "rgba(0,0,0,0.75)";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.justifyContent = "center";
  panel.style.alignItems = "center";
  panel.style.color = "white";
  panel.style.fontSize = "1.2rem";
  panel.style.zIndex = "9999";

  panel.innerHTML = `
    <div style="background:#0f4f2e; padding:20px; border-radius:10px; text-align:center; max-width:420px;">
      <h2>Fine Partita Singola</h2>
      <p>${message}</p>
      <p><strong>Punteggi mano (su 120):</strong></p>
      <p>Tu: ${scores.me}</p>
      <p>IA1: ${scores.ai1}</p>
      <p>IA2: ${scores.ai2}</p>
      <div style="margin-top:15px; display:flex; gap:10px; justify-content:center;">
        <button id="continueMatchBtn" style="padding:8px 14px; border:none; border-radius:6px; background:#e0a800; color:#1b1202; font-weight:bold; cursor:pointer;">
          Prosegui partita
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);

  document.getElementById("continueMatchBtn").onclick = () => {
    document.body.removeChild(panel);
    startNextSingleGame();
  };
}

// ===============================
// STORICO PRESE
// ===============================

function openHistoryPanel() {
  const panel = document.createElement("div");
  panel.id = "historyPanel";
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
  panel.style.fontSize = "1rem";
  panel.style.zIndex = "9999";

  const historyHtml = GAME_STATE.trickHistory
    .map((entry, index) => {
      const n = index + 1;
      const w = entry.winner;
      const s = entry.scores;
      return `
        <div style="margin-bottom:8px; text-align:left;">
          <strong>Presa ${n}:</strong> vince <strong>${w}</strong><br/>
          Punti mano: Tu ${s.me} | IA1 ${s.ai1} | IA2 ${s.ai2}
        </div>
      `;
    })
    .join("");

  panel.innerHTML = `
    <div style="background:#0f4f2e; padding:20px; border-radius:10px; max-height:80%; overflow-y:auto; width:80%; max-width:500px;">
      <h2>Storico prese</h2>
      <div style="margin-top:10px;">
        ${historyHtml || "<p>Nessuna presa ancora.</p>"}
      </div>
      <div style="margin-top:15px; text-align:center;">
        <button onclick="closeHistoryPanel()" style="padding:6px 12px; border:none; border-radius:6px; background:#e0a800; color:#1b1202; font-weight:bold; cursor:pointer;">
          Chiudi
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
}

function closeHistoryPanel() {
  const panel = document.getElementById("historyPanel");
  if (panel) document.body.removeChild(panel);
}

// ===============================
// PANNELLO REGOLE
// ===============================

function openRulesPanel() {
  const panel = document.createElement("div");
  panel.id = "rulesPanel";
  panel.style.position = "fixed";
  panel.style.top = "0";
  panel.style.left = "0";
  panel.style.width = "100%";
  panel.style.height = "100%";
  panel.style.background = "rgba(0,0,0,0.8)";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.justjustifyContent = "center";
  panel.style.alignItems = "center";
  panel.style.color = "white";
  panel.style.fontSize = "1rem";
  panel.style.zIndex = "9999";

  panel.innerHTML = `
    <div style="background:#0f4f2e; padding:20px; border-radius:10px; max-width:520px;">
      <h2>Regole - Joker Briscola</h2>
      <p style="text-align:left; margin-top:10px;">
        - Si gioca in 3 con mazzo da 40 carte, tolto un 2 casuale (39 carte).<br/>
        - Ogni giocatore riceve 3 carte; la carta successiva diventa la briscola scoperta, pescata per ultima.<br/>
        - Si segue il seme, la briscola batte gli altri semi.<br/>
        - Il primo che gioca una carta di briscola diventa il Joker, gli altri due sono alleati.<br/>
        - Punti totali nel mazzo: 120.<br/>
        - Se il Joker fa almeno 51 punti, vince la mano.<br/>
        - Se gli alleati insieme fanno almeno 71 punti, vincono loro.<br/>
        - Il vincitore della mano assegna punti alla partita (fino a raggiungere 10 o più).<br/>
      </p>
      <div style="margin-top:15px; text-align:center;">
        <button onclick="closeRulesPanel()" style="padding:6px 12px; border:none; border-radius:6px; background:#e0a800; color:#1b1202; font-weight:bold; cursor:pointer;">
          Chiudi
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
}

function closeRulesPanel() {
  const panel = document.getElementById("rulesPanel");
  if (panel) document.body.removeChild(panel);
}

// ===============================
// PANNELLO DIFFICOLTÀ IA
// ===============================

function openDifficultyPanel() {
  const panel = document.createElement("div");
  panel.id = "difficultyPanel";
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
  panel.style.fontSize = "1rem";
  panel.style.zIndex = "9999";

  panel.innerHTML = `
    <div style="background:#0f4f2e; padding:20px; border-radius:10px; text-align:center;">
      <h2>Difficoltà IA</h2>
      <p>Seleziona la difficoltà:</p>

      <button onclick="setDifficulty('intermediate')" 
              style="padding:8px 14px; margin:6px; border:none; border-radius:6px; background:#e0a800; color:#1b1202; font-weight:bold; cursor:pointer;">
        Media
      </button>

      <button onclick="setDifficulty('advanced')" 
              style="padding:8px 14px; margin:6px; border:none; border-radius:6px; background:#e0a800; color:#1b1202; font-weight:bold; cursor:pointer;">
        Difficile
      </button>

      <div style="margin-top:15px;">
        <button onclick="closeDifficultyPanel()" 
                style="padding:6px 12px; border:none; border-radius:6px; background:#e0a800; color:#1b1202; font-weight:bold; cursor:pointer;">
          Chiudi
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(panel);
}

function closeDifficultyPanel() {
  const panel = document.getElementById("difficultyPanel");
  if (panel) document.body.removeChild(panel);
}

// ===============================
// AGGIORNAMENTO DIFFICOLTÀ
// ===============================

function setDifficulty(level) {
  window.AI_DIFFICULTY = level;
  updateDifficultyIndicator();
  closeDifficultyPanel();
}

function updateDifficultyIndicator() {
  const text = document.getElementById("difficultyText");
  if (!text) return;

  if (window.AI_DIFFICULTY === "intermediate") {
    text.textContent = "Difficoltà IA: Intermedia";
    text.style.color = "#2a7cff";
  } else {
    text.textContent = "Difficoltà IA: Difficile";
    text.style.color = "#d62828";
  }
}

// ===============================
// JOKER UI
// ===============================

function clearAllJokers() {
  const meBox = document.getElementById("player-me");
  const ai1Box = document.getElementById("player-ai1");
  const ai2Box = document.getElementById("player-ai2");

  if (meBox) meBox.classList.remove("joker");
  if (ai1Box) ai1Box.classList.remove("joker");
  if (ai2Box) ai2Box.classList.remove("joker");
}

function revealJokerUI(playerId) {
  clearAllJokers();
  const box = document.getElementById("player-" + playerId);
  if (!box) return;
  box.classList.add("joker");
}
