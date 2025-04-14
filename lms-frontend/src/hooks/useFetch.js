import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for data fetching
 * @param {Function} fetchFunction - The API function to call
 * @param {Array} deps - Dependencies array to control when to re-fetch
 * @param {boolean} immediate - Whether to fetch immediately on mount
 * @param {any} initialData - Initial data state
 * @returns {Object} - Data, loading state, error, and refetch function
 */
export const useFetch = (fetchFunction, deps = [], immediate = true, initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    if (immediate) {
      fetchData().catch(err => console.error('Error in useFetch:', err));
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchData };
};

export default useFetch;