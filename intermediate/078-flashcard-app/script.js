import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';

// --- Flashcard Component ---
function Flashcard({ card, isFlipped, onFlip }) {
  return (
    <div className={`flashcard-container ${isFlipped ? 'flipped' : ''}`} onClick={onFlip}>
      <div className="flashcard-inner">
        <div className="flashcard-front">
          {card.question}
        </div>
        <div className="flashcard-back">
          {card.answer}
        </div>
      </div>
