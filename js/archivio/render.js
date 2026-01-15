// ------------------------------
// COSTRUISCI PATH DELL'IMMAGINE
// ------------------------------
function getCardImage(card) {
  return `assets/cards/${card.suit}/${card.value}.png`;
}

// ------------------------------
// RENDER CARTA COME IMMAGINE
// ------------------------------
function renderCardImage(card) {
  const container = document.createElement("div");
  container.className = "card card-image";

  const img = document.createElement("img");
  img.src = getCardImage(card);
  img.alt = `${card.value} di ${card.suit}`;
  img.className = "card-img";

  container.appendChild(img);
  return container;
}

// ------------------------------
// MOSTRA UNA CARTA DI TEST
// ------------------------------
function renderTestCard() {
  const playedRow = document.getElementById("played");
  playedRow.innerHTML = ""; // pulizia

  const testCard = {
    suit: "onda",
    value: 1
  };

  const cardEl = renderCardImage(testCard);
  playedRow.appendChild(cardEl);
}
