// script.js

// --- Configuration ---
const CONFIG = {
    TAX_RATE: 0.08, // 8%
    CURRENCY_SYMBOL: '$',
    INVOICE_PREFIX: 'INV-',
    LOCAL_STORAGE_KEY: 'invoiceGeneratorData_v1'
};

// --- DOM Elements ---
const invoiceForm = document.getElementById('invoiceForm');
const clientNameInput = document.getElementById('clientName');
const clientAddressInput = document.getElementById('clientAddress');
const clientEmailInput = document.getElementById('clientEmail');
const invoiceNumberInput = document.getElementById('invoiceNumber');
const invoiceDateInput = document.getElementById('invoiceDate');
const dueDateInput = document.getElementById('dueDate');
const paymentStatusSelect = document.getElementById('paymentStatus');
const addItemButton = document.getElementById('addItem');
const invoiceItemsTableBody = document.getElementById('invoiceItemsTableBody');
const subtotalSpan = document.getElementById
