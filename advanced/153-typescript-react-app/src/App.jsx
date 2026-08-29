import React, { useState, useEffect } from 'react';

// Key Concept: TypeScript Interface for defining data structure
// Defines the shape of an 'Item' object, ensuring consistency throughout the app.
interface Item {
  id: number;
  name: string;
  description?: string; // Optional property, indicated by '?'
}

// Key Concept: TypeScript Interface for a generic API response structure
// This interface uses a generic type parameter 'T' to make it reusable for different data types.
// It provides type safety for asynchronous operations, clearly defining the possible states of a fetch.
interface ApiResponse<T> {
  data: T | null;       // The actual data, or null if not loaded/error
  loading: boolean;     // True if data is being fetched
  error: string | null; // Error message, or null if no error
}

// Key Concept: Generics in a custom React Hook
// This `useFetch` hook is generic, meaning it can fetch data of any specified type 'T'.
// It encapsulates data fetching logic and provides a strongly typed response.
function useFetch<T>(url: string): ApiResponse<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        // Simulate network delay for 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate different API responses based on the URL
        // In a real application, this would be an actual API call (e.g., using `fetch` or `axios`).
        const mockData: { [key: string]: any } = {
          '/api/items': [
            { id: 1, name: 'TypeScript Handbook', description: 'Comprehensive guide to TS' },
            { id: 2, name: 'React Hooks Cheatsheet', description: 'Quick reference for React Hooks' },
            { id: 3, name: 'Generic Programming Patterns', description: 'Reusable code design' },
          ] as Item[], // Type assertion to ensure mock data matches expected Item[] structure
          '/api/single-item': { id: 4, name: 'Advanced Type Utility', description: 'A specific type helper' } as Item, // Type assertion for a single Item
          '/api/empty': [],
          '/api/error-data': { message: 'This is not an Item', code: 500 }, // Example of different data type
        };

        if (url === '/api/error') {
          throw new Error('Failed to fetch data: Simulated server error');
        }

        const result = mockData[url];

        if (result !== undefined) {
          // Key Concept: Type Safety - we assert that the mock result conforms to type T.
          // This is crucial when dealing with dynamically typed data sources (like `mockData`).
          setData(result as T);
        } else {
          setError(`No mock data found for URL: ${url}`);
          setData(null);
        }

      } catch (err: any) { // Catching 'any' for error type, then narrowing it
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]); // Dependency array: effect re-runs if `url` changes

  return { data, loading, error };
}

function App() {
  // Key Concept: Type Safety with React Hooks (useState)
  // `count` is explicitly typed as `number`, preventing assignment of other types.
  const [count, setCount] = useState<number>(0);
  // `message` is explicitly typed as `string`.
  const [message, setMessage] = useState<string>('Hello TypeScript React App!');

  // Key Concept: Using the generic `useFetch` hook for an array of `Item`s.
  // TypeScript infers `items` as `Item[] | null`, `itemsLoading` as `boolean`, `itemsError` as `string | null`.
  const { data: items, loading: itemsLoading, error: itemsError } = useFetch<Item[]>('/api/items');

  // Key Concept: Using the generic `useFetch` hook for a single `Item`.
  // TypeScript infers `singleItem` as `Item | null`.
  const { data: singleItem, loading: singleItemLoading, error: singleItemError } = useFetch<Item>('/api/single-item');

  // Key Concept: Using the generic `useFetch` hook for a simulated error scenario.
  const { data: errorData, loading: errorLoading, error: fetchError } = useFetch<Item[]>('/api/error');

  // Key Concept: Demonstrating a function with typed arguments and return value
  const getGreeting = (name: string): string => {
    return `Welcome, ${name}!`;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>{getGreeting('TypeScript Enthusiast')}</h1>
      <h2>Project #153: Advanced TypeScript React App</h2>

      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h3>React State & Type Safety with `useState`</h3>
        <p>Current Count: <strong>{count}</strong></p>
        <button onClick={() => setCount(prevCount => prevCount + 1)}>Increment Count</button>
        <p>Message: <strong>{message}</strong></p>
        <button onClick={() => setMessage('Message Updated via Type-Safe State!')}>Update Message</button>
        {/* TypeScript would prevent operations like setCount('hello') or setMessage(123) here */}
      </section>

      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h3>Generic Data Fetching (Array of Items)</h3>
        {itemsLoading && <p>Loading items...</p>}
        {itemsError && <p style={{ color: 'red' }}>Error fetching items: {itemsError}</p>}
        {/* Key Concept: Type Safety when mapping over 'items'. */}
        {/* TypeScript knows 'items' is `Item[] | null`, and inside the map, 'item' is correctly inferred as `Item`. */}
        {items && items.length > 0 ? (
          <ul>
            {items.map((item: Item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>: {item.description}
              </li>
            ))}
          </ul>
        ) : (
          !itemsLoading && !itemsError && <p>No items found.</p>
        )}
      </section>

      <section style={{ marginBottom: '30px', border: '1px solid #ccc', padding: '15px' }}>
        <h3>Generic Data Fetching (Single Item)</h3>
        {singleItemLoading && <p>Loading single item...</p>}
        {singleItemError && <p style={{ color: 'red' }}>Error fetching single item: {singleItemError}</p>}
        {/* Key Concept:
