import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';

// Sample Data
const initialData = [
  { id: 1, name: 'Alice', age: 30, city: 'New York' },
  { id: 2, name: 'Bob', age: 24, city: 'London' },
  { id: 3, name: 'Charlie', age: 35, city: 'Paris' },
  { id: 4, name: 'David', age: 29, city: 'Berlin' },
  { id: 5, name: 'Eve', age: 22, city: 'Tokyo' },
  { id: 6, name: 'Frank', age: 40, city: 'Rome' },
  { id: 7, name: 'Grace', age: 28, city: 'Sydney' },
  { id: 8, name: 'Heidi', age: 33, city: 'Dubai' },
];

// Column Definitions
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'age', label: 'Age' },
  { key: 'city', label: 'City' },
];

// Helper function to get sort icon based on current sort state
const getSortIcon = (columnKey, currentSortKey, currentSortDirection) => {
  if (columnKey !== currentSortKey) {
    return '↕'; // Unsorted indicator
  }
  if (currentSortDirection === 'asc') {
    return '↑'; // Ascending indicator
  }
  return '↓'; // Descending indicator
};

function SortableTable({ data, columns }) {
  const [sortKey, setSortKey] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc'); // 'asc' or 'desc'

  const sortedData = useMemo(() => {
    if (!sortKey) {
      return data; // Return original data if no sort key is set
    }

    const sortableData = [...data]; // Create a shallow copy to avoid mutating original data
    sortableData.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      // Handle numeric comparison (and fallback for other comparable types)
      else {
        return sortDirection === 'asc'
          ? (aValue || 0) - (bValue || 0) // Treat null/undefined as 0 for numbers
          : (bValue || 0) - (aValue || 0);
      }
    });
    return sortableData;
  }, [data, sortKey, sortDirection]); // Re-sort only when data, sortKey, or sortDirection changes

  const handleSort = (key) => {
    if (sortKey === key) {
      // If clicking the same column, toggle sort direction
      setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
    } else {
      // If clicking a new column, set it as the sort key and default to 'asc'
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '20px auto' }}>
      <h2>Sortable Data Table</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                onClick={() => handleSort(col.key)}
                style={{
                  cursor: 'pointer',
                  padding: '12px 15px',
                  borderBottom: '2px solid #ddd',
                  backgroundColor: '#f8f8f8',
                  textAlign: 'left',
                  fontWeight: 'bold',
                  userSelect: 'none', // Prevent text selection on click
                }}
              >
                {col.label}
                <span style={{ marginLeft: '8px', color: '#666' }}>
                  {getSortIcon(col.key, sortKey, sortDirection)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row) => (
            <tr key={row.id} style={{ borderBottom: '1px solid #eee' }}>
              {columns.map((col) => (
                <td
                  key={`${row.id}-${col.key}`}
                  style={{
                    padding: '10px 15px',
                    textAlign: 'left',
                  }}
                >
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function App() {
  return (
    <SortableTable data={initialData} columns={columns} />
  );
}

// Render the App component into the 'root' div in index.html
const root =
