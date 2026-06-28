document.addEventListener('DOMContentLoaded', () => {
    // --- State Management ---
    // Initial list items with unique IDs
    let items = [
        { id: '1', content: 'Learn HTML5 Drag & Drop API' },
        { id: '2', content: 'Style with Modern CSS (Flexbox, Variables)' },
        { id: '3', content: 'Implement Vanilla JavaScript Logic' },
        { id: '4', content: 'Make it Responsive and Beautiful' },
        { id: '5', content: 'Test Cross-Browser Compatibility' },
        { id: '6', content: 'Deploy and Share' }
    ];

    // Reference to the list container in the DOM
    const draggableList = document.getElementById('draggable-list');

    // Variables to keep track of the dragged and target elements
    let draggedItem = null; // Stores the HTML element currently being dragged
    let dragOverItem = null; // Stores the HTML element currently being dragged over

    // --- Core Functions ---

    /**
     * Renders the list items to the DOM based on the 'items' array.
     * This acts as the "re-render" step after state changes (like `useState` in frameworks).
     */
    function renderList() {
        draggableList.innerHTML = ''; // Clear existing list items

        items.forEach(item => {
            const li = document.createElement('li');
            li.classList.add('draggable'); // Add base class for styling
            li.setAttribute('draggable', 'true'); // Make the item draggable
            li.dataset.id = item.id; // Store the item's unique ID for identification

            const span = document.createElement('span');
            span.textContent = item.content;
            li.appendChild(span);

            draggableList.appendChild(li);
        });
    }

    /**
     * Handles the start of a drag operation.
     * @param {DragEvent} e - The drag event.
     */
    function handleDragStart(e) {
        draggedItem = e.target; // Set the current dragged item
        e.target.classList.add('dragging'); // Add a class for visual feedback
        // Set data to be transferred (not strictly needed for internal reordering, but good practice)
        e.dataTransfer.setData('text/plain', e.target.dataset.id);
        e.dataTransfer.effectAllowed = 'move'; // Indicate that the item can be moved
    }

    /**
     * Handles the drag over event.
     * Prevents default to allow dropping and applies visual feedback.
     * @param {DragEvent} e - The drag event.
     */
    function handleDragOver(e) {
        e.preventDefault(); // Crucial: Allows dropping by preventing default browser behavior
        
        // Ensure we are dragging over another draggable item, not the list itself or a non-draggable child
        if (e.target.classList.contains('draggable') && e.target !== draggedItem) {
            // Remove 'drag-over' from previous target, if any
            if (dragOverItem && dragOverItem !== e.target) {
                dragOverItem.classList.remove('drag-over');
            }
            dragOverItem = e.target; // Set the new drag over item
            e.target.classList.add('drag-over'); // Add class for visual feedback
        } else if (dragOverItem) {
            // If dragging off a draggable item, remove the class
            dragOverItem.classList.remove('drag-over');
            dragOverItem = null;
        }
    }

    /**
     * Handles the drag leave event.
     * Removes visual feedback when an item leaves a potential drop target.
     * @param {DragEvent} e - The drag event.
     */
    function handleDragLeave(e) {
        // Only remove if the event target is the current dragOverItem
        // This prevents flickering if moving quickly between items.
        if (e.target === dragOverItem) {
            e.target.classList.remove('drag-over');
            dragOverItem = null;
        }
    }

    /**
     * Handles the drop event.
     * Reorders the 'items' array and re-renders the list.
     * @param {DragEvent} e - The drag event.
     */
    function handleDrop(e) {
        e.preventDefault(); // Prevents default browser drop behavior (e.g., opening dropped link)

        if (draggedItem && dragOverItem && draggedItem !== dragOverItem) {
            // Get the IDs of the dragged and target items
            const draggedId = draggedItem.dataset.id;
            const dropTargetId = dragOverItem.dataset.id;

            // Find their current indices in the 'items' array
            const draggedIndex = items.findIndex(item => item.id === draggedId);
            const dropTargetIndex = items.findIndex(item => item.id === dropTargetId);

            if (draggedIndex !== -1 && dropTargetIndex !== -1) {
                // Remove the dragged item from its original position
                const [removed] = items.splice(draggedIndex, 1);
                // Insert the removed item at the new position
                items.splice(dropTargetIndex, 0, removed);

                renderList(); // Re-render the list with the new order
            }
        }
        // Clean up any remaining drag-over class
        if (dragOverItem) {
            dragOverItem.classList.remove('drag-over');
            dragOverItem = null;
        }
    }

    /**
     * Handles the end of a drag operation.
     * Cleans up classes and resets state variables.
     * @param {DragEvent} e - The drag event.
     */
    function handleDragEnd(e) {
        // Remove 'dragging' class from the item that was dragged
        if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        // Ensure all 'drag-over' classes are removed from all items
        // This handles cases where drop might not have occurred on a valid target
        document.querySelectorAll('.draggable.drag-over').forEach(item => {
            item.classList.remove('drag-over');
        });

        // Reset state variables
        draggedItem = null;
        dragOverItem = null;
    }

    // --- Event Listeners (using event delegation on the parent list) ---
    // Event delegation is efficient as it attaches listeners to the parent
    // and handles events for its children, even dynamically added ones.

    // Listens for dragstart events on any child of draggableList that is a '.draggable'
    draggableList.addEventListener('dragstart', (e) => {
        if (e.target.classList.contains('draggable')) {
            handleDragStart(e);
        }
    });

    // Listens for dragover events on draggableList or its children
    draggableList.addEventListener('dragover', handleDragOver);

    // Listens for dragleave events on draggableList or its children
    draggableList.addEventListener('dragleave', handleDragLeave);

    // Listens for drop events on draggableList or its children
    draggableList.addEventListener('drop', handleDrop);

    // Listens for dragend events on any child of draggableList that is a '.draggable'
    // dragend fires on the source element when a drag operation is finished
    draggableList.addEventListener('dragend', (e) => {
        if (e.target.classList.contains('draggable')) {
            handleDragEnd(e);
        }
    });

    // Initial render of the list when the DOM is fully loaded
    renderList();
});
