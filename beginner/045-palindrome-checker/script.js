document.addEventListener('DOMContentLoaded', () => {
    const phraseInput = document.getElementById('phraseInput');
    const checkButton = document.getElementById('checkButton');
    const resultDisplay = document.getElementById('resultDisplay');

    // Function to clean and normalize the input string
    function cleanString(str) {
        // Convert to lowercase and remove all non-alphanumeric characters
        // [^a-z0-9] matches any character that is NOT a lowercase letter (a-z) or a digit (0-9)
        // g flag ensures all occurrences are replaced, not just the first one
        return str.toLowerCase().replace(/[^a-z0-9]/g, '');
    }

    // Function to check if a string is a palindrome
    function isPalindrome(str) {
        const cleaned = cleanString(str);
        // Reverse the cleaned string:
        // 1. split('') converts the string into an array of characters.
        // 2. reverse() reverses the order of elements in the array.
        // 3. join('') concatenates the elements of the array back into a string.
        const reversed = cleaned.split('').reverse().join('');
        return cleaned === reversed; // Compare the cleaned string with its reversed version
    }

    // Function to display the result
    function displayResult(phrase, isPal) {
        // Clear previous classes
        resultDisplay.classList.remove('is-palindrome', 'not-palindrome');

        if (phrase.trim() === '') {
            resultDisplay.textContent = 'Please enter a phrase.';
            resultDisplay.style.color = 'var(--light-text-color)'; // Reset color for empty input
            resultDisplay.style.borderColor = 'var(--border-color)';
            resultDisplay.style.backgroundColor = '#f9f9f9';
            return;
        }

        if (isPal) {
            resultDisplay.textContent = `'${phrase}' is a palindrome!`;
            resultDisplay.classList.add('is-palindrome');
        } else {
            resultDisplay.textContent = `'${phrase}' is NOT a palindrome.`;
            resultDisplay.classList.add('not-palindrome');
        }
    }

    // Event listener for the button click
    checkButton.addEventListener('click', () => {
        const phrase = phraseInput.value;
        const palindrome = isPalindrome(phrase);
        displayResult(phrase, palindrome);
    });

    // Optional: Add event listener for 'Enter' key press in the input field
    phraseInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            checkButton.click(); // Simulate a button click
        }
    });
});
