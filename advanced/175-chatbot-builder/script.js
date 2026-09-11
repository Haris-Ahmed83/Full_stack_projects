// script.js

// --- Global State ---
let nodes = []; // Array to store all nodes
let connections = []; // Array to store all connections between nodes
let selectedNode = null; // Currently selected node for editing/dragging
let isDragging = false; // Flag for node drag operations
let dragOffsetX, dragOffsetY; // Offset for dragging nodes
let connectionStart = null; // { nodeId, portIndex, portType } when drawing a new connection
let currentTemporaryLine = null; // SVG line for drawing temporary connections

// --- DOM Elements ---
const flowEditor = document.getElementById('flow-editor');
const nodePalette = document.getElementById('node-palette');
const propertiesPanel = document.getElementById('properties-panel');
const previewPanel = document.getElementById('preview-panel');
const exportButton = document.getElementById('export-btn');
const previewButton = document.getElementById('preview-btn');

// --- Node Types and Templates (Simplified) ---
const nodeTemplates
