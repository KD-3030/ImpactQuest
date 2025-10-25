'use client';

import { useEffect, useState } from 'react';
import { useRealtime, useRealtimeEvent, REALTIME_EVENTS } from '@/hooks/useRealtime';
import { useQuestPolling } from '@/hooks/usePolling';

/**
 * Example component demonstrating real-time quest updates
 * This component shows how to:
 * 1. Subscribe to real-time events
 * 2. Handle new quest creations
 * 3. Update quest list in real-time
 * 4. Show connection status
 */
export default function RealtimeQuestList() {
  const [quests, setQuests] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Option 1: Use SSE for real-time updates
  const { data, isConnected, error } = useRealtime({
    events: [
      REALTIME_EVENTS.QUEST_CREATED,
      REALTIME_EVENTS.QUEST_UPDATED,
      REALTIME_EVENTS.QUEST_COMPLETED,
    ],
    enabled: true,
    onConnected: () => {
      console.log('✅ Real-time connection established');
      addNotification('Connected to real-time updates');
    },
    onDisconnected: () => {
      console.log('❌ Real-time connection closed');
      addNotification('Disconnected from real-time updates');
    },
  });

  // Option 2: Fallback to polling (if SSE not available or as backup)
  const {
    quests: polledQuests,
    isLoading,
    refetch,
  } = useQuestPolling({
    interval: 10000, // Poll every 10 seconds
    enabled: !isConnected, // Only enable polling if SSE is not connected
  });

  // Helper to add notifications
  const addNotification = (message: string) => {
    setNotifications((prev) => [message, ...prev.slice(0, 4)]);
    setTimeout(() => {
      setNotifications((prev) => prev.slice(0, -1));
    }, 5000);
  };

  // Handle real-time quest creation
  useEffect(() => {
    if (data?.type === REALTIME_EVENTS.QUEST_CREATED) {
      const newQuest = data.quest;
      setQuests((prev) => [newQuest, ...prev]);
      addNotification(`🎉 New quest created: ${newQuest.title}`);
    }
  }, [data]);

  // Handle real-time quest updates
  useEffect(() => {
    if (data?.type === REALTIME_EVENTS.QUEST_UPDATED) {
      const updatedQuest = data.quest;
      setQuests((prev) =>
        prev.map((q) => (q._id === updatedQuest._id ? updatedQuest : q))
      );
      addNotification(`✏️ Quest updated: ${updatedQuest.title}`);
    }
  }, [data]);

  // Handle real-time quest completions
  useEffect(() => {
    if (data?.type === REALTIME_EVENTS.QUEST_COMPLETED) {
      addNotification(`✅ Quest completed! ${data.pointsEarned} points earned!`);
      refetch(); // Refresh quest list
    }
  }, [data, refetch]);

  // Use polled quests if not using real-time
  useEffect(() => {
    if (!isConnected && polledQuests.length > 0) {
      setQuests(polledQuests);
    }
  }, [isConnected, polledQuests]);

  // Initial fetch
  useEffect(() => {
    const fetchInitialQuests = async () => {
      try {
        const response = await fetch('/api/quests');
        const result = await response.json();
        if (result.success) {
          setQuests(result.quests);
        }
      } catch (error) {
        console.error('Error fetching quests:', error);
      }
    };
    fetchInitialQuests();
  }, []);

  return (
    <div className="p-4">
      {/* Connection Status */}
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`h-3 w-3 rounded-full ${
            isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'
          }`}
        />
        <span className="text-sm">
          {isConnected
            ? '🔄 Real-time updates active'
            : '⏱️ Polling mode (updates every 10s)'}
        </span>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="mb-4 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm animate-slide-down"
            >
              {notification}
            </div>
          ))}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">Error: {error.message}</p>
        </div>
      )}

      {/* Quest List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available Quests ({quests.length})</h2>
        {isLoading && quests.length === 0 && (
          <div className="text-center py-8">Loading quests...</div>
        )}
        {quests.length === 0 && !isLoading && (
          <div className="text-center py-8 text-gray-500">No quests available</div>
        )}
        {quests.map((quest) => (
          <div
            key={quest._id}
            className="border rounded-lg p-4 hover:shadow-lg transition-shadow"
          >
            <h3 className="font-bold text-lg">{quest.title}</h3>
            <p className="text-gray-600 text-sm mt-1">{quest.description}</p>
            <div className="flex gap-4 mt-3 text-sm">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                {quest.impactPoints} points
              </span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {quest.category}
              </span>
              {quest.isActive ? (
                <span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                  Active
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">
                  Inactive
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Alternative: Use individual event listeners
 * This approach is cleaner if you only need specific events
 */
export function RealtimeQuestCreationListener() {
  const [latestQuest, setLatestQuest] = useState<any>(null);

  useRealtimeEvent(
    REALTIME_EVENTS.QUEST_CREATED,
    (data) => {
      console.log('New quest created!', data.quest);
      setLatestQuest(data.quest);
      
      // Show browser notification (if permitted)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('New Quest Available!', {
          body: data.quest.title,
          icon: '/icon.png',
        });
      }
    },
    true // enabled
  );

  if (!latestQuest) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm border-2 border-green-500 animate-bounce">
      <h4 className="font-bold text-green-600">🎉 New Quest!</h4>
      <p className="text-sm mt-1">{latestQuest.title}</p>
      <button
        onClick={() => setLatestQuest(null)}
        className="mt-2 text-xs text-gray-500 hover:text-gray-700"
      >
        Dismiss
      </button>
    </div>
  );
}
