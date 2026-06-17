import React, { createContext, useReducer } from 'react';

// Initial state for the expense tracker
const initialState = {
  transactions: []
};

// The Reducer function
// This function determines how the state changes in response to actions.
const AppReducer = (state, action) => {
  switch (action.type) {
    case 'DELETE_TRANSACTION':
      return {
        ...state,
        transactions: state.transactions.filter(transaction => transaction.id !== action.payload)
      };
    case 'ADD_TRANSACTION':
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    default:
      return state;
  }
};

// Create Global Context
// This is where our global state will live and be accessible to all components.
export const GlobalContext = createContext(initialState);

// Provider Component
// This component wraps the parts of your app that need access to the global state.
// It uses useReducer to manage the state and provides the state and actions to its children.
export const GlobalProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AppReducer, initialState);

  // Actions that can be dispatched to change the state
  function deleteTransaction(id) {
    dispatch({
      type: 'DELETE_TRANSACTION',
      payload: id
    });
  }

  function addTransaction(transaction) {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: transaction
    });
  }

  // Helper function for Chart Integration
  // This function processes the transaction data into a format suitable for a chart library.
  function getChartData() {
    const income = state.transactions
      .filter(item => item.amount > 0)
      .reduce((acc, item) => (acc += item.amount), 0)
      .toFixed(2);

    const expense = (
      state.transactions
        .filter(item => item.amount < 0)
        .reduce((acc, item) => (acc += item.amount), 0) * -1
    ).toFixed(2);

    // This structure is typical for chart libraries like Chart.js
    return {
      labels: ['Income', 'Expense'],
      datasets: [
        {
          label: 'Financial Overview',
          data: [income, expense],
          backgroundColor: [
            'rgba(75, 192, 192, 0.6)', // Green for income
            'rgba(255, 99, 132, 0.6)'  // Red for expense
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };
  }

  return (
    <GlobalContext.Provider value={{
      transactions: state.transactions,
      deleteTransaction,
      addTransaction,
      getChartData // Expose the chart data helper function
    }}>
      {children}
    </GlobalContext.Provider>
  );
};
