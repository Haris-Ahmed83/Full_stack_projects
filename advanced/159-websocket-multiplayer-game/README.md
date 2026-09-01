# WebSocket Multiplayer Game #159 🎮
> Experience real-time multiplayer gaming directly in your browser.

## Description
This project implements a real-time, browser-based multiplayer game leveraging WebSockets for instantaneous communication. Players can interact within a shared game world, with the server ensuring state synchronization across all connected clients for a consistent gameplay experience.

## Features
*   **Real-time Multiplayer Gameplay:** Engage with other players simultaneously in a dynamic environment.
*   **Persistent WebSocket Connections:** Utilizes WebSockets for low-latency, bi-directional communication between client and server.
*   **Server-Authoritative Game State:** The server manages the definitive game state, preventing client-side cheating and ensuring fairness.
*   **Room-Based Lobby System:** Players can join distinct game rooms, allowing for multiple concurrent game sessions.
*   **Dynamic Canvas Rendering:** Game graphics and animations are rendered efficiently using the HTML Canvas API.
*   **Optimized Game Loop:** Implements a robust game loop for smooth updates and consistent frame rates across clients.
*   **Player Input Handling:** Captures and processes player actions (e.g., movement) in real-time.

## Tech Stack
*   HTML5
*   CSS3
*   JavaScript (ES6+)
*   Node.js
*   Express.js (for server)
*   WebSockets (`ws` library for Node.js)
*   HTML Canvas API

## Key Concepts Demonstrated
*   **WebSocket**: Establishing persistent, bi-directional communication channels for real-time data exchange between clients and server.
*   **Game Loop**: Implementing a continuous process for updating game state, handling input, and rendering frames to ensure smooth gameplay.
*   **Canvas**: Utilizing the HTML5 Canvas API for dynamic 2D graphics rendering, allowing for complex game visuals and animations.
*   **State Synchronization**: Ensuring consistent game state across all connected clients through server-authoritative updates and efficient data transmission.
*   **Rooms**: Structuring gameplay into isolated lobbies or rooms, enabling multiple concurrent game sessions without interference.

## Getting Started
To get this project up and running locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Haris-Ahmed83/Full_stack_projects.git
    cd Full_stack_projects/project-159-websocket-multiplayer-game # Assuming this project is in a subfolder
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Start the server:**
    ```bash
    npm start
    ```
4.  **Open in browser:**
    Navigate to `http://localhost:[PORT]` in your web browser (check your server's console for the exact port, commonly 3000 or 8080). Open multiple tabs or browsers to simulate multiple players.

## Screenshots
Screenshots coming soon!

## Author
- HarisAhmed83 - https://github.com/Haris-Ahmed83

Part of the [Full_stack_projects](https://github.com/Haris-Ahmed83/Full_stack_projects) series.
