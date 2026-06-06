const textInput = document.getElementById('text-input');
const wordCountSpan = document.getElementById('word-count');
const charCountSpan = document.getElementById('char-count');
const lineCountSpan = document.getElementById('line-count');

textInput.addEventListener('input', () => {
    const text = textInput.value;

    // Character count
    const charCount = text.length;
    charCountSpan.textContent = charCount;

    // Word count
    // Trim leading/trailing whitespace, then split by one or more whitespace characters
    // Filter out any empty strings that might result from multiple spaces
    const words = text.trim().split(/\s+/).filter(word => word !== '');
    const wordCount = words.length;
    wordCountSpan.textContent = wordCount;

    // Line count
    // Split by newline characters. An empty string has 1 line by this logic.
    // If the text is empty, we might want 0 lines.
    const lineCount = text.trim() === '' ? 0 : text.split('\n').length;
    lineCountSpan.textContent = lineCount;
});

// Initialize counts on page load (in case there's pre-filled text or for initial display)
textInput.dispatchEvent(new Event('input'));
