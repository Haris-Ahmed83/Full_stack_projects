const keys = document.querySelectorAll('.key');

function playSound(e) {
  const audio = document.querySelector(`audio[data-key="${e.keyCode || this.dataset.key}"]`);
  const key = document.querySelector(`.key[data-key="${e.keyCode || this.dataset.key}"]`);

  if (!audio) return; // Stop the function from running if no corresponding audio
  
  audio.currentTime = 0; // Rewind to the start
  audio.play();

  key.classList.add('playing');
}

function removeTransition(e) {
  if (e.propertyName !== 'transform') return; // Skip if it's not a transform transition
  this.classList.remove('playing');
}

keys.forEach(key => key.addEventListener('transitionend', removeTransition));
keys.forEach(key => key.addEventListener('click', playSound));
window.addEventListener('keydown', playSound);
