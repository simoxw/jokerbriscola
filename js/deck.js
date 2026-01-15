// ===============================
// GESTIONE MAZZO
// ===============================

function createFullDeck() {
  const deck = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push(createCard(suit.id, rank));
    }
  }
  return deck;
}

function removeRandomTwo(deck) {
  const twos = deck.filter(c => c.rankId === 2);
  const randomTwo = twos[Math.floor(Math.random() * twos.length)];
  const index = deck.indexOf(randomTwo);
  deck.splice(index, 1);
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
}

function dealInitialHands() {
  GAME_STATE.hands.me = GAME_STATE.deck.splice(0, 3);
  GAME_STATE.hands.ai1 = GAME_STATE.deck.splice(0, 3);
  GAME_STATE.hands.ai2 = GAME_STATE.deck.splice(0, 3);
}
