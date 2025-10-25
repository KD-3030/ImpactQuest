'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';

export const REALTIME_EVENTS = {
  QUEST_CREATED: 'quest:created',
  QUEST_UPDATED: 'quest:updated',
  QUEST_COMPLETED: 'quest:completed',
  USER_UPDATED: 'user:updated',
  SUBMISSION_CREATED: 'submission:created',
  SUBMISSION_VERIFIED: 'submission:verified',
} as const;

type RealtimeEvent = typeof REALTIME_EVENTS[keyof typeof REALTIME_EVENTS];

interface UseRealtimeOptions {
  events?: RealtimeEvent[];
  enabled?: boolean;
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

interface RealtimeData {
  type?: string;
  [key: string]: any;
}

/**
 * Custom hook to subscribe to real-time Server-Sent Events
 * Usage:
 * 
 * const { data, isConnected } = useRealtime({
 *   events: [REALTIME_EVENTS.QUEST_CREATED],
 *   enabled: true,
 *   onConnected: () => console.log('Connected'),
 * });
 * 
 * useEffect(() => {
 *   if (data?.type === 'quest:created') {
 *     // Handle new quest
 *   }
 * }, [data]);
 */
export function useRealtime(options: UseRealtimeOptions = {}) {
  const {
    events = Object.values(REALTIME_EVENTS),
    enabled = true,
    onConnected,
    onDisconnected,
    onError,
  } = options;

  const [data, setData] = useState<RealtimeData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttemptsRef = useRef(0);
  
  // Disable SSE in development to prevent connection loops
  // SSE doesn't work reliably in Next.js dev mode
  const isDev = process.env.NODE_ENV === 'development';
  const realtimeEnabled = enabled && !isDev;
  
  // Memoize events array to prevent unnecessary reconnections
  const eventsKey = useMemo(() => events.sort().join(','), [events]);

  const connect = useCallback(() => {
    // Skip if not enabled or in development
    if (!realtimeEnabled || eventSourceRef.current) {
      if (isDev) {
        console.log('Real-time disabled in development mode');
        setIsConnected(false);
      }
      return;
    }

    try {
      const url = `/api/realtime?events=${encodeURIComponent(eventsKey)}`;
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('Real-time connection established');
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;
        onConnected?.();
      };

      eventSource.onerror = (err) => {
        console.error('Real-time connection error:', err);
        setIsConnected(false);
        
        // Close the current connection
        if (eventSourceRef.current) {
          eventSourceRef.current.close();
          eventSourceRef.current = null;
        }
        
        const error = new Error('Real-time connection failed');
        setError(error);
        onError?.(error);

        // Only reconnect if still enabled
        if (realtimeEnabled) {
          // Exponential backoff for reconnection
          const delay = Math.min(1000 * Math.pow(2, reconnectAttemptsRef.current), 30000);
          reconnectAttemptsRef.current += 1;

          console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      // Listen for all subscribed events
      events.forEach((event) => {
        eventSource.addEventListener(event, ((e: MessageEvent) => {
          try {
            const eventData = JSON.parse(e.data);
            setData({ type: event, ...eventData });
          } catch (error) {
            console.error(`Error parsing event data for ${event}:`, error);
          }
        }) as EventListener);
      });

      // Listen for heartbeat
      eventSource.addEventListener('heartbeat', ((e: MessageEvent) => {
        // Just to keep connection alive
        console.debug('Heartbeat received');
      }) as EventListener);

      // Listen for connection message
      eventSource.addEventListener('message', ((e: MessageEvent) => {
        try {
          const messageData = JSON.parse(e.data);
          if (messageData.type === 'connected') {
            console.log('Connected to real-time events:', messageData.events);
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      }) as EventListener);

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Error creating EventSource:', error);
      const err = error instanceof Error ? error : new Error('Failed to connect');
      setError(err);
      onError?.(err);
    }
  }, [realtimeEnabled, eventsKey, events, onConnected, onError, isDev]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setIsConnected(false);
      onDisconnected?.();
      console.log('Real-time connection closed');
    }
  }, [onDisconnected]);

  useEffect(() => {
    if (realtimeEnabled) {
      connect();
    }

    return () => {
      disconnect();
    };
    // Only reconnect when enabled changes or events change, not when callbacks change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtimeEnabled, eventsKey]);

  return {
    data,
    isConnected,
    error,
    reconnect: connect,
    disconnect,
  };
}

/**
 * Hook to listen for specific real-time events with a callback
 * Usage:
 * 
 * useRealtimeEvent(REALTIME_EVENTS.QUEST_CREATED, (data) => {
 *   console.log('New quest created:', data.quest);
 *   // Update your state here
 * });
 */
export function useRealtimeEvent(
  event: RealtimeEvent,
  callback: (data: any) => void,
  enabled = true
) {
  const { data } = useRealtime({ events: [event], enabled });

  useEffect(() => {
    if (data && data.type === event) {
      callback(data);
    }
  }, [data, event, callback]);
}
