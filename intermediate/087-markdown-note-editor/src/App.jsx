import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const LOCAL_STORAGE_KEY = 'markdown-note-editor-content';

function App() {
  const [markdown, setMarkdown] = useState(() => {
    // Initialize from localStorage
    const savedContent = localStorage.getItem(LOCAL_STORAGE_KEY);
    return savedContent !== null ? savedContent : '# Hello Markdown!\n\nThis is a simple **Markdown Note Editor**.\n\n- Type markdown on the left.\n- See the preview on the right.\n\nChanges are saved automatically to your browser\'s local storage.\n\n```javascript\nconst greet = "Hello, world!";\nconsole.log(greet);\n```\n\nYou can also [export your note](javascript:void(0)) as a `.md` file.';
  });

  // Save to localStorage whenever markdown changes
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, markdown);
  }, [markdown]);

  const handleEditorChange = (event) => {
    setMarkdown(event.target.value);
  };

  const handleExport = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'my-markdown-note.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the URL object
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: 'sans-serif', margin: 0, padding: 0 }}>
      <header style={{ padding: '10px 20px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5em', color: '#333' }}>Markdown Note Editor</h1>
        <button
          onClick={handleExport}
          style={{
            padding: '8px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.9em',
            fontWeight: 'bold',
            transition: 'background-color 0.2s ease'
          }}
        >
          Export as .md
        </button>
      </header>

      <div style={{ display: 'flex', flexGrow: 1 }}>
        {/* Editor Pane */}
        <textarea
          value={markdown}
          onChange={handleEditorChange}
          style={{
            flex: 1,
            padding: '20px',
            fontSize: '1em',
            border: 'none',
            borderRight: '1px solid #ddd',
            outline: 'none',
            resize: 'none',
            backgroundColor: '#fdfdfd',
            lineHeight: '1.6',
            fontFamily: 'monospace'
          }}
          placeholder="Start typing your markdown here..."
        />

        {/* Preview Pane */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            backgroundColor: '#ffffff',
            boxShadow: 'inset 2px 0 5px rgba(0,0,0,0.02)',
            lineHeight: '1.6',
            color: '#333'
          }}
        >
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default App;
