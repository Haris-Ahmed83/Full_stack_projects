const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20; // Size of each snake segment and food item
const canvasWidth = canvas.width;
const canvasHeight = canvas.height;

let snake;
let food;
let direction;
let score;
let gameSpeed; // Milliseconds
