const cards = document.querySelectorAll('.memory-card');

let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchesFound = 0;
const totalPairs = cards.length / 2;

function flipCard() {
    if (lockBoard) return;
    if (this === firstCard)
