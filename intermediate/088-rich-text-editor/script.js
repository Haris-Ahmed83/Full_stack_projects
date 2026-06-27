document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const toolbar = document.getElementById('toolbar');

    // Ensure the editor div is contentEditable
    if (editor) {
        editor.setAttribute('contenteditable', 'true');
        // Add some default content if the editor is empty
        if (editor.innerHTML.trim() === '') {
            editor.innerHTML = '<p>Start typing here...</p>';
        }
    }

    // Add event listener to the toolbar for button clicks and select changes
    if (toolbar) {
        toolbar.addEventListener('click', (event) => {
            const target = event.target;
            const command = target.dataset.command;

            if (command && target.tagName === 'BUTTON') {
                // Keep the editor focused to apply commands correctly
                editor.focus();

                switch (command) {
                    case 'createLink':
                        const url = prompt('Enter the URL:');
                        if (url) {
                            document.execCommand(command, false, url);
                        }
                        break;
                    // For simple commands, directly execute
                    default:
                        document.execCommand(command, false, null);
                        break;
                }
            }
        });

        // Handle select elements specifically for commands like formatBlock, fontSize, etc.
        toolbar.addEventListener('change', (event) => {
            const target = event.target;
            const command = target.dataset.command;

            if (command && target.tagName === 'SELECT') {
                editor.focus();
                // For select elements, the value is the argument for execCommand
                document.execCommand(command, false, target.value);
            }
        });
    }
});
