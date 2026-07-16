import React, { useState, useEffect, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import io from 'socket.io-client';

// --- Contexts ---
const AuthContext = createContext(null);
const SocketContext = createContext(null);

// --- Placeholder Components (normally in separate files) ---

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
    </div>
);

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const socket = useContext(SocketContext);

    const handleLogout = () => {
        logout();
        // Optional: emit a "userLoggedOut" event to the
