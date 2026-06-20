// Define a class for the Progress Bar component
class ProgressBar {
    constructor(parentElement, id, initialValue = 0, label = 'Progress', color = null) {
        // Store properties for internal use and access
        this.id = id;
        this._value = 0; // Internal value, updated via setter
        this._label = label;
        this._color = color; // Optional custom color for the bar fill

        // Create main container for the component
        this.componentElement = document.createElement('div');
        this.componentElement.classList.add('progress-bar-component');
        // Custom attribute to easily find this component later (e.g., for updates)
        this.componentElement.dataset.progressBarId = id;

        // Create label element
        this.labelElement = document.createElement('span');
        this.labelElement.classList.add('progress-bar-label-text');
        this.labelElement.textContent = this._label;

        // Create the progress bar container (the track)
        this.containerElement = document.createElement('div');
        this.containerElement.classList.add('progress-bar-container');

        // Create the progress bar fill (the actual progress)
        this.fillElement = document.createElement('div');
        this.fillElement.classList.add('progress-bar-fill');
        
        // Create a span to display the percentage value inside the fill
        this.fillValueElement = document.createElement('span');
        this.fillElement.appendChild(this.fillValueElement);

        // Assemble the component: fill inside container, label and container inside component root
        this.containerElement.appendChild(this.fillElement);
        this.componentElement.appendChild(this.labelElement);
        this.componentElement.appendChild(this.containerElement);

        // Append the complete component to the specified parent element in the DOM
        parentElement.appendChild(this.componentElement);

        // Set initial value and color using the setters to apply initial styles
        this.value = initialValue;
        if (this._color) {
            this.fillElement.style.backgroundColor = this._color;
        }
    }

    // Getter for the progress value
    get value() {
        return this._value;
    }

    // Setter for the progress value, handles validation and DOM updates
    set value(newValue) {
        // Ensure the value is within the 0-100 range
        const clampedValue = Math.max(0, Math.min(100, newValue));
        if (clampedValue !== this._value) {
            this._value = clampedValue;
            // Update the width of the fill element dynamically, triggering CSS transition
            this.fillElement.style.width = `${this._value}%`;
            // Update the text displayed inside the fill element
            this.fillValueElement.textContent = `${this._value}%`;
        }
    }

    // Getter for the label text
    get label() {
        return this._label;
    }

    // Setter for the label text, updates DOM
    set label(newLabel) {
        if (newLabel !== this._label) {
            this._label = newLabel;
            this.labelElement.textContent = this._label;
        }
    }

    // Method to update both value, label, and optionally color
    update(newValue, newLabel = this._label, newColor = this._color) {
        this.value = newValue; // Use the setter for value
        this.label = newLabel; // Use the setter for label
        // Update color if a new one is provided and it's different
        if (newColor && newColor !== this._color) {
            this._color = newColor;
            this.fillElement.style.backgroundColor = this._color;
        }
    }

    // Method to get the root DOM element of the component
    getElement() {
        return this.componentElement;
    }

    // Method to remove the component from the DOM
    remove() {
        this.componentElement.remove();
    }
}

// --- Main application logic --- 
// Execute code once the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const progressBarsContainer = document.getElementById('progressBarsContainer');
    // Object to store ProgressBar instances, allowing easy access by ID
    const progressBars = {}; 

    // Initialize a few sample progress bars
    const bar1 = new ProgressBar(progressBarsContainer, 'task-1', 75, 'Task Completion 1', 'var(--primary-color)');
    const bar2 = new ProgressBar(progressBarsContainer, 'task-2', 30, 'Project Progress 2', 'var(--secondary-color)');
    // Demonstrate custom color override
    const bar3 = new ProgressBar(progressBarsContainer, 'task-3', 90, 'Download Status 3', '#FF5722'); 
    
    progressBars['task-1'] = bar1;
    progressBars['task-2'] = bar2;
    progressBars['task-3'] = bar3;

    // --- Event Listeners for Controls --- 

    // Update Task 1 (Random) button handler
    document.getElementById('updateBar1Btn').addEventListener('click', () => {
        const randomValue = Math.floor(Math.random() * 101); // Generate a random value between 0 and 100
        progressBars['task-1'].update(randomValue, `Task Completion 1 (${randomValue}%)`);
    });

    // Reset All Bars button handler
    document.getElementById('resetBarsBtn').addEventListener('click', () => {
        // Iterate over all stored ProgressBar instances and reset their value
        Object.values(progressBars).forEach(bar => {
            bar.update(0);
        });
    });

    // Add New Bar button handler
    let barCount = 3; // Keep track of existing bars to generate unique IDs
    document.getElementById('addBarBtn').addEventListener('click', () => {
        barCount++;
        const newId = `task-${barCount}`;
        const newLabel = `New Task ${barCount}`;
        const randomValue = Math.floor(Math.random() * 101);
        // Generate a random HSL color for the new bar
        const randomColor = `hsl(${Math.random() * 360}, 70%, 50%)`; 

        // Create and store a new ProgressBar instance
        const newBar = new ProgressBar(progressBarsContainer, newId, randomValue, newLabel, randomColor);
        progressBars[newId] = newBar;
    });

    // Update Specific Bar button handler
    document.getElementById('updateSpecificBarBtn').addEventListener('click', () => {
        const specificBarIdInput = document.getElementById('specificBarId');
        const specificBarValueInput = document.getElementById('specificBarValue');

        const barId = specificBarIdInput.value;
        // Parse the input value as an integer
        const barValue = parseInt(specificBarValueInput.value);

        // Check if the bar exists and the provided value is a valid number
        if (progressBars[barId] && !isNaN(barValue)) {
            // Update the specific bar, also updating its label to show the current percentage
            progressBars[barId].update(barValue, `${progressBars[barId].label.split('(')[0].trim()} (${barValue}%)`);
        } else {
            alert(`Progress bar with ID "${barId}" not found or invalid value provided.`);
        }
    });
});
