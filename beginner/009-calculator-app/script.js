const calculatorScreen = document.querySelector('.calculator-screen');
const calculatorButtons = document.querySelector('.calculator-buttons');

let fullExpression = ''; // Stores the full mathematical expression as a string
let displayValue = '0'; // What's currently shown on the calculator screen
let expectingNewNumber = false; // True when the next digit should start a new number (after an
