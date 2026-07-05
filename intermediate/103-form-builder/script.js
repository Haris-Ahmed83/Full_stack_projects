// State management
let formFields = [];
let fieldIdCounter = 0;

// DOM Elements
const toolbox = document.getElementById('toolbox');
const formPreview = document.getElementById('form-preview');
const saveFormBtn = document.getElementById('save-form');

// Drag and Drop variables
let draggedFieldType = null; // For new fields from toolbox
let draggedFieldId = null;   // For reordering existing fields
let dropTargetId = null;     // To identify where an existing field is dropped
let dropPosition = 'after';  // 'before' or 'after' for re
