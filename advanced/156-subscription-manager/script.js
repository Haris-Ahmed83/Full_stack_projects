// --- Data Definitions (Simulated) ---

// Available subscription plans
const plans = [
    {
        id: 'basic_monthly',
        name: 'Basic Monthly',
        price: 9.99,
        currency: 'USD',
        cycle: 'monthly',
        features: ['5GB Storage', '1 User', 'Email Support']
    },
    {
        id: 'pro_monthly',
        name: 'Pro Monthly',
        price: 19.99,
        currency: 'USD',
        cycle: 'monthly',
        features: ['50GB Storage', '5 Users', 'Priority Support', 'Advanced Analytics']
    },
    {
        id: 'premium_annual',
        name: 'Premium Annual',
        price: 199.99,
        currency: 'USD',
        cycle: 'yearly',
        features: ['Unlimited Storage', 'Unlimited Users', '24/7 Support', 'Custom Integrations'],
        highlight: true
    },
    {
        id: 'free_trial',
        name: 'Free Trial',
        price: 0.00,
        currency: 'USD',
        cycle: 'monthly',
        features: ['1GB Storage', '1 User', '7-day trial'],
        trialDays: 7
    }
];

// User's current subscriptions (sample data)
let subscriptions = [
    {
        id: 'sub_001',
        planId: 'pro_monthly',
        status: 'active', // active, cancelled, pending_cancellation
        startDate: '2023-01-15',
        nextBillingDate: '2024-02-15', // Example: Assuming current date is Jan 2024
        paymentMethod: 'Visa **** 1234'
    },
    {
        id: 'sub_002',
        planId: 'basic_monthly',
        status: 'active',
        startDate: '2023-10-01',
        nextBillingDate: '2024-02-01',
        paymentMethod: 'MasterCard **** 5678'
    }
];

// --- DOM Elements ---
const subscriptionsList = document.getElementById('subscriptionsList');
const noSubscriptionsMessage = document.getElementById('noSubscriptionsMessage');
const plansList = document.getElementById('plansList');
const planSelect = document.getElementById('planSelect');
const addSubscriptionBtn = document.getElementById('addSubscriptionBtn');
const customerPortalBtn = document.getElementById('customerPortalBtn');

// --- Helper Functions ---

/**
 * Formats a date string into a more readable format (e.g., 'Feb 15, 2024').
 * @param {string} dateString - The date in 'YYYY-MM-DD' format.
 * @returns {string} Formatted date string.
 */
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Calculates the next billing date based on a start date and cycle.
 * @param {string} startDateStr - The start date in 'YYYY-MM-DD' format.
 * @param {string} cycle - 'monthly' or 'yearly'.
 * @returns {string} The next billing date in 'YYYY-MM-DD' format.
 */
function calculateNextBillingDate(startDateStr, cycle) {
    const date = new Date(startDateStr);
    if (cycle === 'monthly') {
        date.setMonth(date.getMonth() + 1);
    } else if (cycle === 'yearly') {
        date.setFullYear(date.getFullYear() + 1);
    }
    // Ensure the day doesn't roll over to the next month if original day was e.g. 31st and next month has 30 days.
    // A simpler approach for this demo: just let the date object handle it.
    return date.toISOString().split('T')[0];
}

/**
 * Generates a unique ID for new subscriptions.
 * @returns {string} A unique subscription ID.
 */
function generateUniqueId() {
    return 'sub_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// --- Rendering Functions ---

/**
 * Renders the list of current subscriptions in the UI.
 */
function renderSubscriptions() {
    subscriptionsList.innerHTML = ''; // Clear existing subscriptions

    if (subscriptions.length === 0) {
        noSubscriptionsMessage.classList.remove('hidden');
        return;
    }
    noSubscriptionsMessage.classList.add('hidden');

    subscriptions.forEach(sub => {
        const plan = plans.find(p => p.id === sub.planId);
        if (!plan) return; // Skip if plan not found

        const subscriptionCard = document.createElement('div');
        subscriptionCard.className = 'subscription-card card';
        subscriptionCard.dataset.id = sub.id;

        const statusClass = sub.status === 'cancelled' ? 'cancelled' : '';

        subscriptionCard.innerHTML = `
            <h3>${plan.name}</h3>
            <p><strong>Status:</strong> <span class="status ${statusClass}">${sub.status.replace('_', ' ')}</span></p>
            <p><strong>Price:</strong> ${plan.currency} ${plan.price.toFixed(2)} / ${plan.cycle}</p>
            <p><strong>Started:</strong> ${formatDate(sub.startDate)}</p>
            <p><strong>Next Billing:</strong> ${formatDate(sub.nextBillingDate)}</p>
            <p><strong>Payment:</strong> ${sub.paymentMethod}</p>
            <ul class="features-list">
                ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
            <div class="card-actions">
                ${sub.status === 'active' ? `<button class="button danger cancel-btn" data-id="${sub.id}">Cancel</button>` : `<button class="button" disabled>Cancelled</button>`}
            </div>
        `;
        subscriptionsList.appendChild(subscriptionCard);
    });

    // Add event listeners for cancel buttons
    document.querySelectorAll('.cancel-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const subId = event.target.dataset.id;
            if (confirm(`Are you sure you want to cancel subscription ${subId}?`)) {
                cancelSubscription(subId);
            }
        });
    });
}

/**
 * Renders the list of available plans in the UI.
 */
function renderPlans() {
    plansList.innerHTML = ''; // Clear existing plans

    plans.forEach(plan => {
        const planCard = document.createElement('div');
        planCard.className = `plan-card card ${plan.highlight ? 'premium' : ''}`;

        const priceDisplay = plan.price === 0
            ? 'FREE' : `${plan.currency} ${plan.price.toFixed(2)} <span>/ ${plan.cycle}</span>`;

        planCard.innerHTML = `
            <h3>${plan.name}</h3>
            <div class="price">${priceDisplay}</div>
            <ul class="features-list">
                ${plan.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        `;
        plansList.appendChild(planCard);
    });
}

/**
 * Populates the dropdown for adding new subscriptions with available plans.
 */
function populatePlanSelect() {
    planSelect.innerHTML = '<option value="" disabled selected>Select a plan...</option>'; // Default option
    plans.forEach(plan => {
        const option = document.createElement('option');
        option.value = plan.id;
        option.textContent = `${plan.name} - ${plan.currency} ${plan.price.toFixed(2)} / ${plan.cycle}`;
        planSelect.appendChild(option);
    });
}

// --- Event Handlers ---

/**
 * Handles the addition of a new subscription.
 */
function addSubscription() {
    const selectedPlanId = planSelect.value;
    if (!selectedPlanId) {
        alert('Please select a plan to subscribe.');
        return;
    }

    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    if (!selectedPlan) {
        alert('Selected plan not found.');
        return;
    }

    const today = new Date().toISOString().split('T')[0]; // Current date as YYYY-MM-DD
    const newSubscription = {
        id: generateUniqueId(),
        planId: selectedPlan.id,
        status: 'active',
        startDate: today,
        // Calculate next billing date based on plan cycle, starting from today
        nextBillingDate: calculateNextBillingDate(today, selectedPlan.cycle),
        paymentMethod: 'New Card **** 0000' // Placeholder for new subscriptions
    };

    subscriptions.push(newSubscription);
    renderSubscriptions(); // Re-render the subscriptions list
    planSelect.value = ''; // Reset the dropdown
    alert(`Successfully subscribed to ${selectedPlan.name}!`);
}

/**
 * Handles the cancellation of an existing subscription.
 * @param {string} subscriptionId - The ID of the subscription to cancel.
 */
function cancelSubscription(subscriptionId) {
    const subIndex = subscriptions.findIndex(sub => sub.id === subscriptionId);
    if (subIndex > -1) {
        // In a real app, this would typically update status to 'pending_cancellation' or similar,
        // and the subscription would remain active until the end of the current billing period.
        // For this demo, we'll simulate immediate cancellation by changing status.
        subscriptions[subIndex].status = 'cancelled';
        subscriptions[subIndex].nextBillingDate = 'N/A'; // No more billing
        renderSubscriptions(); // Re-render to reflect the change
        alert(`Subscription ${subscriptionId} has been cancelled.`);
    } else {
        alert('Subscription not found.');
    }
}

/**
 * Simulates accessing a customer portal.
 */
function customerPortalHandler() {
    alert('Redirecting to a simulated Customer Portal... (This is a demo feature)');
    // In a real application, this would redirect to a Stripe Customer Portal URL or similar.
}

// --- Initialize Application ---

// Attach event listeners
addSubscriptionBtn.addEventListener('click', addSubscription);
customerPortalBtn.addEventListener('click', customerPortalHandler);

// Initial rendering of UI components
renderSubscriptions();
renderPlans();
populatePlanSelect();
