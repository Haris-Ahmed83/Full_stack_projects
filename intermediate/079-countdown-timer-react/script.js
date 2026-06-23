import React, { useState, useEffect, useRef } from 'react';

function CountdownTimer() {
  // State for the remaining time in seconds
  const [timeLeft, setTimeLeft] = useState(0);
  // State to control if the timer is running
  const [isRunning, setIsRunning] = useState(false);
  // State to store the initial time set by the user (in seconds)
  const [initialTime, setInitialTime] = useState(0);

  // Ref to store the interval ID for cleanup
  const timerIdRef = useRef(null);
  // Ref for the input field to get user time
  const inputRef = useRef(null);

  // useEffect hook for timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      // Start the interval
      timerIdRef.current = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      // Timer finished, stop it
      setIsRunning(false);
      clearInterval(timerIdRef.current); // Ensure interval is cleared immediately
    }

    // Cleanup function: clear the interval when the component unmounts
    // or when isRunning/timeLeft dependencies change and the interval needs to be reset
    return () => {
      clearInterval(timerIdRef.current);
    };
  }, [isRunning, timeLeft]); // Dependencies: re-run effect when isRunning or timeLeft changes

  // Function to format time for display (MM:SS)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Event handlers
  const handleSetTime = () => {
    const inputMinutes = parseInt(inputRef.current.value, 10);
    if (!isNaN(inputMinutes) && inputMinutes > 0) {
      const newTimeInSeconds = inputMinutes * 60;
      setInitialTime(newTimeInSeconds);
      setTimeLeft(newTimeInSeconds);
      setIsRunning(false); // Stop timer if running when new time is set
      inputRef.current.value = ''; // Clear input field after setting
    } else {
      alert("Please enter a valid number of minutes (e.g., 5 for 5 minutes).");
    }
  };

  const handleStart = () => {
    if (timeLeft > 0) {
      setIsRunning(true);
    } else if (initialTime > 0) {
      // If timeLeft is 0 but initialTime was set, restart with initialTime
      setTimeLeft(initialTime);
      setIsRunning(true);
    } else {
      alert("Please set a timer duration first.");
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(initialTime); // Reset to the initial set time
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', textAlign: 'center', marginTop: '50px', maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
      <h1 style={{ color: '#333' }}>Countdown Timer</h1>

      <div style={{ marginBottom: '20px' }}>
        <input
          type="number"
          ref={inputRef}
          placeholder="Set minutes (e.g., 5)"
          min="1"
          style={{ padding: '8px', marginRight: '10px', width: '120px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <button onClick={handleSetTime} style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}>
          Set Timer
        </button>
      </div>

      <div style={{ fontSize: '4em', fontWeight: 'bold', marginBottom: '30px', color: '#007bff' }}>
        {formatTime(timeLeft)}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
        <button
          onClick={handleStart}
          disabled={isRunning || (timeLeft === 0 && initialTime === 0)}
          style={{ padding: '10px 20px', fontSize: '1.2em', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Start
        </button>
        <button
          onClick={handlePause}
          disabled={!isRunning}
          style={{ padding: '10px 20px', fontSize: '1.2em', cursor: 'pointer', backgroundColor: '#ffc107', color: '#333', border: 'none', borderRadius: '4px' }}
        >
          Pause
        </button>
        <button
          onClick={handleReset}
          disabled={timeLeft === 0 && initialTime === 0 && !isRunning}
          style={{ padding: '10px 20px', fontSize: '1.2em', cursor: 'pointer', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Reset
        </button
