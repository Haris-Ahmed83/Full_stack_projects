let healthData = [];
let goals = {
    targetWeight: 70, // kg or lbs, assuming kg for now
    targetCalories: 2000, // kcal
    targetActivityMinutes: 60 // minutes
};

let weightChartInstance;
let activityChartInstance;

const dataEntryForm = document.getElementById('dataEntryForm');
const dateInput = document.getElementById('dateInput');
const weightInput = document.getElementById('weightInput');
const caloriesInput = document.getElementById('caloriesInput');
const activityInput = document.getElementById('activityInput');

const targetWeightInput = document.getElementById('targetWeightInput');
const targetCaloriesInput = document.getElementById('targetCaloriesInput');
const targetActivityInput = document.getElementById('targetActivityInput');
const saveGoalsButton = document.getElementById('saveGoalsButton');

const currentWeightSpan = document.getElementById('currentWeight');
const targetWeightSpan = document.getElementById('targetWeight');
const weight
