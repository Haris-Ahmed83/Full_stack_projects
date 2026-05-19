const billAmountInput = document.getElementById('billAmount');
const tipPercentageSlider = document.getElementById('tipPercentageSlider');
const tipPercentageValueSpan = document.getElementById('tipPercentageValue');
const tipAmountSpan = document.getElementById('tipAmount');
const totalAmountSpan = document.getElementById('totalAmount');

function calculateTip() {
    const billAmount = parseFloat(billAmountInput.value);
    const tipPercentage = parseInt(tipPercentageSlider.value);

    // Update tip percentage display
    tipPercentageValueSpan.textContent = `${tipPercentage}%`;

    // Perform calculations
    if (isNaN(billAmount) || billAmount < 0) {
        tipAmountSpan.textContent = '0.00';
        totalAmountSpan.textContent = '0.00';
        return;
    }

    const tipAmount = billAmount * (tipPercentage / 100);
    const totalAmount = billAmount + tipAmount;

    // Update UI
    tipAmountSpan.textContent = tipAmount.toFixed(2);
    totalAmountSpan.textContent = totalAmount.toFixed(2);
}

// Add event listeners
billAmountInput.addEventListener('input', calculateTip);
tipPercentageSlider.addEventListener('input', calculateTip);

// Initial calculation when the page loads
document.addEventListener('DOMContentLoaded', calculateTip);
