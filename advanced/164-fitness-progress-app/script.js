let appData = {
    workouts: [],
    photos: [],
    goals: [],
    streak: 0,
    lastWorkoutDate: null // Store as Date object for easier comparison
};

// --- Constants & DOM Elements ---
const WORKOUTS_KEY = 'fitnessAppWorkouts';
const PHOTOS_KEY = 'fitnessAppPhotos';
const GOALS_KEY = 'fitnessAppGoals';
const STREAK_KEY = 'fitnessAppStreak';
const LAST_WORKOUT_DATE_KEY = 'fitnessAppLastWorkoutDate';

// DOM Elements (assuming basic IDs in index.html)
const workoutForm = document.getElementById('workoutForm');
const workoutList = document.getElementById('workoutList');
const photoInput = document.getElementById('photoInput');
const photoGallery = document.getElementById('photoGallery');
const goalsForm = document.getElementById('goalsForm');
const goalsList = document.getElementById('goalsList');
const streakCounterElement =
