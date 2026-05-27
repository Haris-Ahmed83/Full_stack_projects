const draggables = document.querySelectorAll('.item');
const containers = document.querySelectorAll('.container');

draggables.forEach(item => {
    item.addEventListener('dragstart', (e) => {
        // Store the ID of the dragged element
        e.dataTransfer.setData('text/plain', item.id);
        // Add a class to indicate dragging state
        item.classList.add('dragging');
    });

    item.addEventListener('dragend', () => {
        // Remove the dragging class when drag ends (item dropped or cancelled)
        item.classList.remove('dragging');
    });
});

containers.forEach(container => {
    container.addEventListener('dragover', (e) => {
        // Prevent default to allow drop
        e.preventDefault();
        // Add a class to indicate valid drop target
        container.classList.add('hovered');
    });

    container.addEventListener('dragleave', () => {
        // Remove the hovered class when drag leaves the container
        container.classList.remove('hovered');
    });

    container.addEventListener('drop', (e) => {
        e.preventDefault();
        // Get the ID of the dragged element
        const itemId = e.dataTransfer.getData('text/plain');
        const draggable = document.getElementById(itemId);

        // Append the dragged element to the current container
        container.appendChild(draggable);
        // Remove the hovered class
        container.classList.remove('hovered');
        // The dragend event listener will automatically remove the 'dragging' class from the item
    });
});
