'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UsePollingOptions {
  interval?: number; // Polling interval in milliseconds (default: 5000)
  enabled?: boolean;
  onData?: (data: any) => void;
  onError?: (error: Error) => void;
}

/**
 * Custom hook for polling data from an endpoint
 * Usage:
 * 
 * const { data, isLoading, refetch } = usePolling('/api/quests', {
 *   interval: 5000, // Poll every 5 seconds
 *   enabled: true,
 * });
 */
export function usePolling<T = any>(
  url: string,
  options: UsePollingOptions = {}
) {
  const {
    interval = 5000,
    enabled = true,
    onData,
    onError,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (isMountedRef.current) {
        setData(result);
        setLastUpdate(Date.now());
        onData?.(result);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch data');
      
      if (isMountedRef.current) {
        setError(error);
        onError?.(error);
      }
      
      console.error('Polling error:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [url, enabled, onData, onError]);

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      // Fetch immediately on mount
      fetchData();

      // Then set up polling
      intervalRef.current = setInterval(fetchData, interval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    lastUpdate,
    refetch,
  };
}

/**
 * Hook for polling quests with change detection
 */
export function useQuestPolling(options: UsePollingOptions = {}) {
  const { data, ...rest } = usePolling('/api/quests', options);
  
  return {
    quests: data?.quests || [],
    count: data?.count || 0,
    ...rest,
  };
}

/**
 * Hook for polling user data
 */
export function useUserPolling(walletAddress: string, options: UsePollingOptions = {}) {
  const url = walletAddress ? `/api/user/${walletAddress}` : '';
  const { data, ...rest } = usePolling(url, {
    ...options,
    enabled: !!walletAddress && options.enabled !== false,
  });
  
  return {
    user: data?.user || null,
    ...rest,
  };
}
