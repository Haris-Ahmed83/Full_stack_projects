import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

// DOM Elements
const fileInput = document.getElementById('fileInput');
const outputFormatSelect = document.getElementById('outputFormat');
const convertBtn = document.getElementById('convertBtn');
const filesList = document.getElementById('filesList');
const globalProgressBar = document.getElementById('globalProgressBar');
const messageArea = document.getElementById('messageArea');
const loadingOverlay = document.getElementById('loadingOverlay');

let filesToProcess = []; // Array of { file: File, id: string, status: string, progress: number, outputUrl: string, outputFilename: string, error: string }
let isFfmpegLoaded = false;
let isConverting = false;

// Helper to display messages
function displayMessage(message, type = 'info') {
    messageArea.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    messageArea.style.display = 'block';
