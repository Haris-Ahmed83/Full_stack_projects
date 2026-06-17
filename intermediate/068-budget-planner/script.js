import React, { useState, useContext, createContext, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuidV4 } from 'uuid';

// --- Context API ---
const BudgetsContext = createContext();

export function useBudgets() {
  return useContext(BudgetsContext);
}

export const UNCATEGORIZED_BUDGET_ID = "Uncategorized";

export function BudgetsProvider({ children }) {
  const [budgets, setBudgets] = useState(() => {
    const localBudgets = localStorage.getItem("budgets
