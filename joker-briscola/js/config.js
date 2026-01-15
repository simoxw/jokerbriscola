// ===============================
// CONFIGURAZIONE DI BASE DEL GIOCO
// ===============================

const SUITS = [
  { id: "onda",   name: "Onda" },
  { id: "roccia", name: "Roccia" },
  { id: "stella", name: "Stella" },
  { id: "foglia", name: "Foglia" }
];

const RANKS = [
  { id: 1,  rank: "asso",    file: 1,  points: 11, order: 10 },
  { id: 2,  rank: "due",     file: 2,  points: 0,  order: 1  },
  { id: 3,  rank: "tre",     file: 3,  points: 10, order: 9  },
  { id: 4,  rank: "4",       file: 4,  points: 0,  order: 2  },
  { id: 5,  rank: "5",       file: 5,  points: 0,  order: 3  },
  { id: 6,  rank: "6",       file: 6,  points: 0,  order: 4  },
  { id: 7,  rank: "7",       file: 7,  points: 0,  order: 5  },
  { id: 8,  rank: "fante",   file: 8,  points: 2,  order: 6  },
  { id: 9,  rank: "cavallo", file: 9,  points: 3,  order: 7  },
  { id: 10, rank: "re",      file: 10, points: 4,  order: 8  }
];

const RANK_MAP = Object.fromEntries(RANKS.map(r => [r.id, r]));

const AI_DIFFICULTY = "intermediate";

const JOKER_MIN_POINTS = 51;
const ALLIES_MIN_POINTS = 71;

const MATCH_POINTS_JOKER_WIN = 2;
const MATCH_POINTS_ALLY_WIN = 1;
const MATCH_TARGET = 10;

// ===============================
// FUNZIONI DI SUPPORTO
// ===============================

function createCard(suit, rankDef) {
  return {
    suit: suit,
    rankId: rankDef.id,
    rank: rankDef.rank,
    file: rankDef.file,
    points: rankDef.points,
    order: rankDef.order
  };
}

function getCardPoints(card) {
  return card.points;
}

function isSameSuit(cardA, cardB) {
  return cardA.suit === cardB.suit;
}

function describeCard(card) {
  return `${card.rank} di ${card.suit}`;
}
