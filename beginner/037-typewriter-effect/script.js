document.addEventListener('DOMContentLoaded', () => {
    // Select the element where the typewriter text will be displayed
    const typewriterElement = document.getElementById('typewriter-text');

    // The text content to be typed out
    const textToType = "Hello, world! This is a simple typewriter effect using JavaScript.";

    // Variable to keep track of the current character index
    let charIndex = 0;

    // Set the typing speed in milliseconds per character
    const typingSpeed = 75; // Adjust this value to make it faster or slower

    // Function to simulate typing one character at a time
    function typeWriter() {
        // Check if there are more characters to type
        if (charIndex < textToType.length) {
            // Append the next character to the element's text content
            typewriterElement.textContent += textToType.charAt(charIndex);
            charIndex++; // Move to the next character
        } else {
            // If all characters have been typed, stop the interval
            clearInterval(typingInterval);
            // Optional: You might want to remove the blinking cursor effect from CSS here
            // typewriterElement.style.borderRight = 'none';
            // typewriterElement.style.animation = 'none';
        }
    }

    // Start the typing effect using setInterval
    // The typeWriter function will be called repeatedly at the specified typingSpeed
    const typingInterval = setInterval(typeWriter, typingSpeed);
});
