document.addEventListener('DOMContentLoaded', () => {
    // --- Global State --- //
    let boardState = []; // Array of column objects, each containing an array of card objects.
    let draggedCardId = null; // Stores the ID of the card being dragged.
    let draggedColumnId = null; // Stores the ID of the column from which the card is dragged.

    // --- DOM Elements --- //
    const boardContainer = document.getElementById('board-container');
    const addColumnBtn = document.getElementById('add-column-btn');

    // --- Utility Functions --- //

    // Generates a simple unique ID for cards and columns.
    function generateUniqueId() {
        return 'id-' + Date.now() + '-' + Math.random().toString(36).substring(2, 9);
    }

    // Saves the current board state to localStorage.
    function saveState() {
        localStorage.setItem('trelloBoardState', JSON.stringify(boardState));
    }

    // Loads the board state from localStorage or initializes with default data.
    function loadState() {
        const storedState = localStorage.getItem('trelloBoardState');
        if (storedState) {
            boardState = JSON.parse(storedState);
        } else {
            // Default data for the board
            boardState = [
                {
                    id: generateUniqueId(),
                    title: 'To Do',
                    cards: [
                        { id: generateUniqueId(), content: 'Plan project structure' },
                        { id: generateUniqueId(), content: 'Design UI layout' }
                    ]
                },
                {
                    id: generateUniqueId(),
                    title: 'In Progress',
                    cards: [
                        { id: generateUniqueId(), content: 'Implement drag and drop' },
                        { id: generateUniqueId(), content: 'Refine styling' }
                    ]
                },
                {
                    id: generateUniqueId(),
                    title: 'Done',
                    cards: [
                        { id: generateUniqueId(), content: 'Set up HTML boilerplate' },
                        { id: generateUniqueId(), content: 'Initialize project files' }
                    ]
                }
            ];
            saveState(); // Save default state immediately
        }
    }

    // --- DOM Creation Functions --- //

    // Creates a card element based on card data.
    function createCardElement(card, columnId) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card';
        cardDiv.setAttribute('draggable', 'true');
        cardDiv.dataset.cardId = card.id;
        cardDiv.dataset.columnId = columnId; // Store columnId on card for easier drag handling

        const contentSpan = document.createElement('span');
        contentSpan.className = 'card-content';
        contentSpan.textContent = card.content;

        const deleteButton = document.createElement('button');
        deleteButton.className = 'card-delete-btn';
        deleteButton.textContent = '×';
        deleteButton.title = 'Delete Card';
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent card drag from starting
            if (confirm('Are you sure you want to delete this card?')) {
                deleteCard(columnId, card.id);
            }
        });

        cardDiv.appendChild(contentSpan);
        cardDiv.appendChild(deleteButton);

        cardDiv.addEventListener('dragstart', handleDragStart);
        cardDiv.addEventListener('dragend', handleDragEnd);

        return cardDiv;
    }

    // Creates a column element based on column data.
    function createColumnElement(column) {
        const columnDiv = document.createElement('div');
        columnDiv.className = 'column';
        columnDiv.dataset.columnId = column.id;

        const columnHeader = document.createElement('div');
        columnHeader.className = 'column-header';
        const columnTitle = document.createElement('h2');
        columnTitle.textContent = column.title;
        const deleteColumnButton = document.createElement('button');
        deleteColumnButton.className = 'column-delete-btn';
        deleteColumnButton.textContent = '×';
        deleteColumnButton.title = 'Delete Column';
        deleteColumnButton.addEventListener('click', () => {
            if (confirm(`Are you sure you want to delete the column "${column.title}" and all its cards?`)) {
                deleteColumn(column.id);
            }
        });
        columnHeader.appendChild(columnTitle);
        columnHeader.appendChild(deleteColumnButton);

        const cardsContainer = document.createElement('div');
        cardsContainer.className = 'cards-container';
        cardsContainer.dataset.columnId = column.id; // Mark as a drop target for cards
        cardsContainer.addEventListener('dragover', handleDragOver);
        cardsContainer.addEventListener('dragleave', handleDragLeave);
        cardsContainer.addEventListener('drop', handleDrop);

        column.cards.forEach(card => {
            cardsContainer.appendChild(createCardElement(card, column.id));
        });

        const addCardButton = document.createElement('button');
        addCardButton.className = 'add-card-btn';
        addCardButton.textContent = '+ Add a card';
        addCardButton.addEventListener('click', () => addCard(column.id));

        columnDiv.appendChild(columnHeader);
        columnDiv.appendChild(cardsContainer);
        columnDiv.appendChild(addCardButton);

        return columnDiv;
    }

    // --- Render Function --- //

    // Renders the entire board based on the current boardState.
    function renderBoard() {
        boardContainer.innerHTML = ''; // Clear existing board content
        boardState.forEach(column => {
            boardContainer.appendChild(createColumnElement(column));
        });
    }

    // --- State Manipulation Functions --- //

    // Adds a new column to the boardState.
    function addColumn() {
        const title = prompt('Enter column title:');
        if (title && title.trim() !== '') {
            boardState.push({
                id: generateUniqueId(),
                title: title.trim(),
                cards: []
            });
            saveState();
            renderBoard();
        }
    }

    // Deletes a column from the boardState.
    function deleteColumn(columnId) {
        boardState = boardState.filter(col => col.id !== columnId);
        saveState();
        renderBoard();
    }

    // Adds a new card to a specific column.
    function addCard(columnId) {
        const content = prompt('Enter card content:');
        if (content && content.trim() !== '') {
            const column = boardState.find(col => col.id === columnId);
            if (column) {
                column.cards.push({
                    id: generateUniqueId(),
                    content: content.trim()
                });
                saveState();
                renderBoard();
            }
        }
    }

    // Deletes a card from a specific column.
    function deleteCard(columnId, cardId) {
        const column = boardState.find(col => col.id === columnId);
        if (column) {
            column.cards = column.cards.filter(card => card.id !== cardId);
            saveState();
            renderBoard();
        }
    }

    // --- Drag and Drop Handlers --- //

    // Fired when a draggable element starts being dragged.
    function handleDragStart(e) {
        draggedCardId = e.target.dataset.cardId;
        draggedColumnId = e.target.dataset.columnId;
        e.dataTransfer.setData('text/plain', draggedCardId); // Set data for drag operation
        e.target.classList.add('is-dragging'); // Add visual feedback for the dragged item
    }

    // Fired when a draggable element is being dragged over a valid drop target.
    function handleDragOver(e) {
        e.preventDefault(); // Essential to allow dropping
        const target = e.target.closest('.cards-container, .card'); // Find nearest cards container or card

        if (target && target.classList.contains('cards-container')) {
            // If dragging over a column's cards container
            // Only add 'drag-over' if not dragging over the column it originated from without other cards
            const targetColumnId = target.dataset.columnId;
            if (targetColumnId !== draggedColumnId || target.children.length > 0) {
                 // Ensure we don't apply drag-over to an empty column if dragging within itself.
                target.classList.add('drag-over');
            }
        } else if (target && target.classList.contains('card')) {
            // If dragging over another card, add 'drag-over' to that card
            target.classList.add('drag-over');
        }
    }

    // Fired when a draggable element leaves a valid drop target.
    function handleDragLeave(e) {
        const target = e.target.closest('.cards-container, .card');
        if (target) {
            target.classList.remove('drag-over');
        }
    }

    // Fired when a draggable element is dropped on a valid drop target.
    function handleDrop(e) {
        e.preventDefault(); // Essential to allow dropping
        const dropTarget = e.target.closest('.cards-container, .card'); // Determine the actual drop target

        if (!dropTarget) return; // If dropped outside a valid area, do nothing

        const targetColumnId = dropTarget.dataset.columnId || dropTarget.closest('.column').dataset.columnId; // Get target column ID
        const targetCardId = dropTarget.dataset.cardId; // Get target card ID if dropped on a card

        // Remove 'drag-over' class from all potential drop targets
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));

        if (!draggedCardId || !draggedColumnId || !targetColumnId) return; // Ensure we have all necessary IDs

        const sourceColumn = boardState.find(col => col.id === draggedColumnId);
        const targetColumn = boardState.find(col => col.id === targetColumnId);

        if (!sourceColumn || !targetColumn) return; // Should not happen if IDs are valid

        const cardIndex = sourceColumn.cards.findIndex(card => card.id === draggedCardId);
        if (cardIndex === -1) return; // Card not found in source column

        const [movedCard] = sourceColumn.cards.splice(cardIndex, 1); // Remove card from source

        if (targetCardId) {
            // Dropped on another card: insert before/after based on position
            const targetCardIndex = targetColumn.cards.findIndex(card => card.id === targetCardId);
            if (targetCardIndex !== -1) {
                // Determine if we drop before or after the target card
                const dropRect = dropTarget.getBoundingClientRect();
                const dropY = e.clientY;
                if (dropY < dropRect.top + dropRect.height / 2) {
                    targetColumn.cards.splice(targetCardIndex, 0, movedCard); // Insert before
                } else {
                    targetColumn.cards.splice(targetCardIndex + 1, 0, movedCard); // Insert after
                }
            } else {
                targetColumn.cards.push(movedCard); // Fallback: add to end if target card not found (shouldn't happen)
            }
        } else {
            // Dropped on an empty cards-container: add to the end of the column
            targetColumn.cards.push(movedCard);
        }

        saveState();
        renderBoard(); // Re-render the entire board to reflect state changes
    }

    // Fired when the drag operation ends (e.g., mouse button released).
    function handleDragEnd(e) {
        e.target.classList.remove('is-dragging'); // Remove visual feedback
        // Clear any lingering drag-over classes
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        draggedCardId = null;
        draggedColumnId = null;
    }

    // --- Initialization --- //

    // Attaches event listeners and renders the initial board.
    function init() {
        loadState();
        renderBoard();

        addColumnBtn.addEventListener('click', addColumn);
    }

    init(); // Call init when the DOM is ready
});
