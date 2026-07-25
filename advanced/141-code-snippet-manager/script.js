// Global variables
let snippets = [];
let editingSnippetId = null;
let currentTags = []; // Tags for the current snippet being added/edited
let nextSnippetId = 1; // Used for new snippet IDs

// DOM Elements
const snippetList = document.getElementById('snippet-list');
const snippetForm = document.querySelector('.snippet-form');
const snippetIdInput = document.getElementById('snippet-id');
const snippetTitleInput = document.getElementById('snippet-title');
const snippetLanguageSelect = document.getElementById('snippet-language');
const snippetCodeTextarea = document.getElementById('snippet-code');
const tagInputContainer = document.getElementById('tag-input-container');
const tagInput = document.getElementById('tag-input');
const saveSnippetBtn = document.getElementById('save-snippet-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const searchInput = document.getElementById('search-input');

// --- Local Storage Functions
