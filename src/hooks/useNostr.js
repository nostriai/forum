import { useState, useEffect } from 'react';
import { getNostrData } from '../services/nostrService';

/**
 * Custom hook to fetch data from the Nostr protocol.
 *
 * @returns {object} An object containing data, loading and error states.
 */
export default function useNostr() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getNostrData()
      .then((result) => {
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
