// script.js

// --- State Management ---
let surveyQuestions = []; // Array to hold question objects
let currentQuestionId = 0; // Simple ID counter for new questions
let isPreviewMode = false;

// --- DOM Elements ---
const surveyEditorContainer = document.getElementById('survey-editor-container');
const addQuestionBtn = document.getElementById('add-question-btn');
const togglePreviewBtn = document.getElementById('toggle-preview-btn');
const editorArea = document.getElementById('editor-area');
const previewArea = document.getElementById('preview-area');
const surveyPreviewContainer = document.getElementById('survey-
