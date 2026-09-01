// script.js

// --- Constants and Global Variables ---
const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');
const socket = io(); // Connect to the Socket.io server

const colorPicker = document.getElementById('colorPicker');
const lineWidthRange = document.getElementById('lineWidth');
const clearBtn = document.getElementById('clearBtn');
const undoBtn = document.getElementById('undoBtn');
const redoBtn = document.getElementById('redoBtn');
const penToolBtn = document.getElementById('penTool');
const eraserToolBtn = document.getElementById('eraserTool');

let isDrawing = false;
let currentTool = 'pen'; // 'pen' or 'eraser'
let currentColor = '#000000';
let currentLineWidth = 5;
let lastX = 0;
let lastY = 0;

// A unique ID for this client to prevent self-drawing from broadcast events
const clientId
