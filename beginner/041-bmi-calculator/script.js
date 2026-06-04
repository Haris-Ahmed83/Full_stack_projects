// Get DOM elements
const bmiForm = document.getElementById('bmiForm');
const heightInput = document.getElementById('height');
const weightInput = document.getElementById('weight');
const resultContainer = document.getElementById('resultContainer');
const bmiValueSpan = document.getElementById('bmiValue');
const bmiCategorySpan = document.getElementById('bmiCategory');

// Add event listener for form submission
bmiForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Clear previous results and classes
    bmiValueSpan.textContent = '';
    bmiCategorySpan.textContent = '';
    resultContainer.className = ''; // Remove all classes

    // Get input values
    const heightCm = parseFloat(heightInput.value);
    const weightKg = parseFloat(weightInput.value);

    // Input validation
    if (isNaN(heightCm) || heightCm <= 0) {
        alert('Please enter a valid height (positive number in cm).');
        return;
    }
    if (isNaN(weightKg) || weightKg <= 0) {
        alert('Please enter a valid weight (positive number in kg).');
        return;
    }

    // Convert height from cm to meters
    const heightMeters = heightCm / 100;

    // Calculate BMI
    const bmi = (weightKg / (heightMeters * heightMeters)).toFixed(1); // Round to 1 decimal place

    let category = '';
    let categoryClass = '';

    // Determine BMI category and assign CSS class
    if (bmi < 18.5) {
        category = 'Underweight';
        categoryClass = 'bmi-underweight';
    } else if (bmi >= 18.5 && bmi <= 24.9) {
        category = 'Normal weight';
        categoryClass = 'bmi-normal';
    } else if (bmi >= 25 && bmi <= 29.9) {
        category = 'Overweight';
        categoryClass = 'bmi-overweight';
    } else { // bmi >= 30
        category = 'Obesity';
        categoryClass = 'bmi-obese';
    }

    // Display results
    bmiValueSpan.textContent = bmi;
    bmiCategorySpan.textContent = category;
    resultContainer.classList.add('
