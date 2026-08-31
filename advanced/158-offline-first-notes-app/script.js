// script.js

// --- IndexedDB Setup ---
const DB_NAME = 'notes_db';
const DB_VERSION = 1;
const STORE_NAME = 'notes';
let db;

function openDb() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                objectStore.createIndex('updatedAt', 'updatedAt', { unique: false });
                objectStore.createIndex('status', 'status', { unique: false });
                objectStore.createIndex('serverId', 'serverId', { unique: false });
                console.log('IndexedDB upgraded: object store
