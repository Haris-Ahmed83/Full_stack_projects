import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

// Modal Component
const Modal = ({ isOpen, onClose, children, title }) => {
  const modalRef = useRef(null);
  const previousActiveElement = useRef(null); // To store the element that had focus before the modal opened

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement; // Store the currently focused element
      document.body.style.overflow = 'hidden'; // Prevent scrolling on the body when modal is open
