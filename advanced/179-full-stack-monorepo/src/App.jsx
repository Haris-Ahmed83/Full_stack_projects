import React from 'react';

function App() {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f0f2f5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#333', fontSize: '2.5em' }}>
        Project #179: Full Stack Monorepo
      </h1>
      <p style={{ color: '#555', fontSize: '1.2em', maxWidth: '600px', lineHeight: '1.5' }}>
        This application is part of a full-stack monorepo, leveraging key concepts like Turborepo,
        shared packages, ESLint, TypeScript, and robust workspace configurations.
      </p>
      <p style={{ color: '#777', fontSize: '1em', marginTop: '20px' }}>
        Edit <code>src/App.jsx</code> and save to reload.
      </p>
    </div>
  );
}

export default App;
