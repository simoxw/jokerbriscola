// ===============================
// PRELOAD AUTOMATICO DI TUTTE LE CARTE
// ===============================

function preloadAllCards() {
  const suits = ["foglia", "onda", "roccia", "stella"];
  const maxCards = 10; // 1.png → 10.png

  suits.forEach(suit => {
    for (let i = 1; i <= maxCards; i++) {
      const img = new Image();
      img.src = `assets/cards/${suit}/${i}.png`;
    }
  });

  console.log("✔ Tutte le carte sono state precaricate.");
}

window.addEventListener("load", preloadAllCards);
