// Get all piano keys
const pianoKeys = document.querySelectorAll('.key');

// Map keyboard keys to piano key elements for quick lookup
const keyMap = {};
pianoKeys.forEach(key => {
    if (key.dataset.key) {
        keyMap[key.dataset.key] = key;
    }
});

// Audio Context for playing
