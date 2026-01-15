// ===============================
// STATO DI GIOCO
// ===============================

const GAME_STATE = {
  matchScore: {
    me: 0,
    ai1: 0,
    ai2: 0
  },

  dealer: null,
  currentPlayer: null,
  jokerPlayer: null,
  briscolaSuit: null,

  deck: [],

  hands: {
    me: [],
    ai1: [],
    ai2: []
  },

  tricksWon: {
    me: [],
    ai1: [],
    ai2: []
  },

  currentTrick: {
    starter: null,
    cards: {
      me: null,
      ai1: null,
      ai2: null
    }
  },

  // 🔒 blocco input giocatore
  inputLocked: false
};
