document.addEventListener('DOMContentLoaded', () => {
    // Quiz questions data
    const questions = [
        {
            question: "What does HTML stand for?",
            options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"],
            correctAnswer: "Hyper Text Markup Language"
        },
        {
            question: "Which CSS property is used for changing the font of an element?",
            options: ["font-style", "text-style", "font-family", "typography"],
            correctAnswer: "font-family"
        },
        {
            question: "Which JavaScript keyword is used to declare a constant variable?",
            options: ["var", "let", "const", "static"],
            correctAnswer: "const"
        },
        {
            question: "What is the primary purpose of JavaScript?",
            options: ["Styling web pages", "Structuring web content", "Adding interactivity to web pages", "Managing server databases"],
            correctAnswer: "Adding interactivity to web pages"
        },
        {
            question: "What is the correct way to refer to an external script called 'script.js'?",
            options: ["<script href='script.js'>", "<script name='script.js'>", "<script src='script.js'>", "<script file='script.js'>"],
            correctAnswer: "<script src='script.js'>"
        },
        {
            question: "Which of the following is NOT a JavaScript data type?",
            options: ["String", "Boolean", "Float", "Symbol"],
            correctAnswer: "Float"
        }
    ];

    // DOM Elements
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');

    const startButton = document.getElementById('start-button');
    const questionElement = document.getElementById('question');
    const optionsContainer = document.getElementById('options-container');
    const timerElement = document.getElementById('time-left');
    const initialTimeElement = document.getElementById('initial-time');
    const scoreElement = document.getElementById('score');
    const finalMessageElement = document.getElementById('final-message');
    const totalQuestionsElement = document.getElementById('total-questions');
    const restartButton = document.getElementById('restart-button');

    // State Variables
    let currentQuestionIndex = 0;
    let score = 0;
    let timeLeft = 60; // Default time for the quiz
    let timerInterval; // Stores the interval ID for the timer

    // Function to initialize or reset the quiz state
    function initQuiz() {
        // Display the start screen and hide others
        startScreen.classList.add('active');
        quizScreen.classList.remove('active');
        resultScreen.classList.remove('active');

        // Reset quiz state variables
        currentQuestionIndex = 0;
        score = 0;
        timeLeft = 60; // Reset time to default
        timerElement.textContent = timeLeft; // Update timer display
        initialTimeElement.textContent = timeLeft; // Update initial time display
        clearInterval(timerInterval); // Ensure no old timers are running
    }

    // Function to start the timer countdown
    function startTimer() {
        timerInterval = setInterval(() => {
            timeLeft--;
            timerElement.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timerInterval);
                endQuiz(); // End quiz if time runs out
            }
        }, 1000); // Update every 1 second
    }

    // Function to start the quiz
    function startQuiz() {
        // Hide start screen, show quiz screen
        startScreen.classList.remove('active');
        quizScreen.classList.add('active');
        resultScreen.classList.remove('active');

        startTimer(); // Begin the countdown
        displayQuestion(); // Show the first question
    }

    // Function to display the current question and its options
    function displayQuestion() {
        const currentQuestion = questions[currentQuestionIndex];
        questionElement.textContent = currentQuestion.question;
        optionsContainer.innerHTML = ''; // Clear previous options

        // Create a button for each option
        currentQuestion.options.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('btn', 'option-btn');
            button.textContent = option;
            // Attach an event listener to check the answer when an option is clicked
            button.addEventListener('click', () => checkAnswer(button, option));
            optionsContainer.appendChild(button);
        });
    }

    // Function to check the selected answer
    function checkAnswer(selectedOptionElement, selectedAnswer) {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        if (isCorrect) {
            score++;
            selectedOptionElement.classList.add('correct'); // Visual feedback for correct answer
        } else {
            selectedOptionElement.classList.add('incorrect'); // Visual feedback for incorrect answer
            // Optionally highlight the correct answer
            Array.from(optionsContainer.children).forEach(optionBtn => {
                if (optionBtn.textContent === currentQuestion.correctAnswer) {
                    optionBtn.classList.add('correct-hint'); // Hint for the correct answer
                }
            });
        }

        // Disable all option buttons to prevent multiple selections for the same question
        Array.from(optionsContainer.children).forEach(button => button.disabled = true);

        // Wait for a moment to show feedback, then proceed to the next question or end the quiz
        setTimeout(() => {
            // Clear feedback classes and re-enable buttons (they will be replaced for next question)
            Array.from(optionsContainer.children).forEach(button => {
                button.classList.remove('correct', 'incorrect', 'correct-hint');
                button.disabled = false;
            });

            currentQuestionIndex++; // Move to the next question
            if (currentQuestionIndex < questions.length) {
                displayQuestion(); // Display the next question
            } else {
                endQuiz(); // If no more questions, end the quiz
            }
        }, 800); // 0.8 seconds feedback time
    }

    // Function to end the quiz and display results
    function endQuiz() {
        clearInterval(timerInterval); // Stop the timer

        // Hide quiz screen, show result screen
        quizScreen.classList.remove('active');
        resultScreen.classList.add('active');

        // Update score and message on the result screen
        scoreElement.textContent = score;
        totalQuestionsElement.textContent = questions.length;

        let message = '';
        if (score === questions.length) {
            message = "Fantastic! You got all questions correct!";
        } else if (score >= questions.length / 2) {
            message = "Good effort! You did well.";
        } else {
            message = "Keep practicing! You'll get there.";
        }
        finalMessageElement.textContent = message;
    }

    // Function to restart the quiz
    function restartQuiz() {
        initQuiz(); // Reset state and show start screen
    }

    // Event Listeners
    startButton.addEventListener('click', startQuiz);
    restartButton.addEventListener('click', restartQuiz);

    // Initialize the quiz when the page loads
    initQuiz();
});
