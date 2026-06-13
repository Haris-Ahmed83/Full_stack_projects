// Get references to the editor textarea and the preview div
const editor = document.getElementById('editor');
const preview = document.getElementById('preview');

// Define initial markdown content
const initialMarkdown = `
# Welcome to my Markdown Previewer!

## Type your Markdown here
### And see the real-time preview below

This is a paragraph. You can write anything you want.

**Bold text** and *italic text* are easy to create.
You can also ~~strike through text~~.

Here's a list:
- Item 1
- Item 2
  - Sub-item 2.1
  - Sub-item 2.2

And an ordered list:
1. First item
2. Second item
3. Third item

\`Inline code\` is useful for small code snippets.

\`\`\`javascript
// Code blocks are perfect for larger code examples
function greet(name) {
  return \`Hello, \${name}!\`;
}
console.log(greet("Markdown"));
\`\`\`

> Blockquotes are great for highlighting important information.

You can also add [links](https://www.freecodecamp.org) and images:

![FreeCodeCamp Logo](https://cdn.freecodecamp.org/testable-projects-fcc/images/fcc_primary.svg)
`;

// Set the initial value of the editor
editor.value = initialMarkdown;

// Function to update the preview area
function updatePreview() {
  // Get the current markdown text from the editor
  const markdownText = editor.value;

  // Use marked.js to parse the markdown into HTML
  // The 'marked' object should be available globally if loaded via CDN
  const html = marked.parse(markdownText);

  // Update the innerHTML of the preview div
  preview.innerHTML = html;
}

// Add an event listener to the editor to update the preview in real-time
editor.addEventListener('input', updatePreview);

// Call updatePreview once initially to render the default content on page load
updatePreview();
