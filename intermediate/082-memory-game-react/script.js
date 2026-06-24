import React, { useState, useEffect } from 'react';
import './App.css'; // Assuming you have basic styling in App.css

// Array of unique card values (e.g., emojis, letters, symbols)
const CARD_VALUES = ['🍎', '🍌', '🍒', '🍇', '🍋', '🥝', '🍓', '🍍'];

// Helper function to shuffle an array (Fisher-Yates algorithm)
const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// Card Component
const Card = ({ card, handleCardClick, isFlipped, isMatched, isDisabled }) => {
  const handleClick = () => {
    // Only allow clicks if the card is not already flipped, not matched, and the board is not disabled
    if (!isFlipped && !isMatched && !isDisabled) {
      handleCardClick(card.id);
    }
  };

  return (
    <div
      className={`card ${isFlipped || isMatched ? 'flipped' : ''}`}
      onClick={handleClick}
    >
      <div className="card-inner">
        <div className="card-front">?</div>
        <div className="card-back">{card.value}</div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const [cards, setCards] = useState([]); // All cards in the game
  const [flippedCards, setFlippedCards] = useState([]); // IDs of currently flipped cards (max 2)
  const [matchedCards, setMatchedCards] = useState([]); // IDs of cards that have been matched
  const [moves, setMoves] = useState(0); // Number of pairs attempted
  const [gameOver, setGameOver] = useState(false); // Game over status
  const [disableBoard, setDisableBoard] = useState(false); // To prevent clicks during match check delay

  // Function to initialize or reset the game
  const initializeGame = () => {
    // Duplicate card values to create pairs, then shuffle
    const initialCards = shuffleArray(
      CARD_VALUES
