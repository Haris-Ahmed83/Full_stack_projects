# Video Chat App 📹
> Seamless real-time video communication for collaborative experiences.

## Description
This project is an advanced web-based video chat application designed to facilitate multi-user communication. It enables participants to connect and interact via real-time video and audio streams, demonstrating core concepts of modern web communication.

## Features
*   Real-time video and audio streaming between multiple participants.
*   Dynamic video grid layout to display all active users.
*   Secure peer-to-peer connections for media exchange.
*   Robust signaling mechanism for session negotiation.
*   Intuitive web interface for easy access and participation.
*   Scalable architecture for handling multiple concurrent chat rooms.

## Tech Stack
*   WebRTC
*   Socket.io
*   Node.js
*   HTML5
*   CSS3
*   JavaScript

## Key Concepts Demonstrated
*   **WebRTC:** Utilizes Web Real-Time Communication API for direct peer-to-peer exchange of video and audio streams between browsers, enabling low-latency communication without intermediary servers for media.
*   **Socket.io Signaling:** Employs Socket.io for a WebSocket-based signaling server to exchange crucial connection metadata (such as SDP offers/answers and ICE candidates) between peers, facilitating the initial WebRTC handshake.
*   **Peer-to-Peer:** Establishes direct client-to-client connections for media transfer, significantly reducing server load and improving privacy by keeping media streams decentralized.
*   **Video Grid:** Implements a dynamic and responsive grid layout to efficiently display multiple incoming video streams from all participants within a single chat room.

## Getting Started
- npm install && npm start

## Screenshots
![Screenshot of Video Chat App](path/to/screenshot1.png)
*(Placeholder: Replace with actual screenshots of the application in action)*

## Author
- HarisAhmed83 - https://github.com/Haris-Ahmed83

Part of the [Full_stack_projects](https://github.com/Haris-Ahmed83/Full_stack_projects) series.
