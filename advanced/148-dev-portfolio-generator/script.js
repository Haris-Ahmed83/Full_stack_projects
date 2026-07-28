// --- DOM Elements ---
const sectionTemplatesContainer = document.getElementById('section-templates');
const livePreview = document.getElementById('live-preview');
const exportBtn = document.getElementById('export-btn');
const saveBtn = document.getElementById('save-btn');

// --- Global State ---
let portfolioSections = []; // Stores the current sections in the portfolio

// --- Section Templates Data ---
const sectionTemplates = [
    {
        id: 'hero',
        name: 'Hero Section',
        html: `
            <section class="hero-section" data-section-type="hero">
                <div class="container">
                    <h1 contenteditable="true" data-content-key="hero-h1">John Doe</h1>
                    <p contenteditable="true" data-content-key="hero-p">Full-Stack Developer | Innovator | Problem Solver</p>
                    <a href="#" contenteditable="true" data-content-key
