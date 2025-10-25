'use client';

import { useEffect, useState } from 'react';
import { useRealtime, REALTIME_EVENTS } from '@/hooks/useRealtime';
import { useQuestPolling } from '@/hooks/usePolling';

export default function RealtimeTestPage() {
  const [quests, setQuests] = useState<any[]>([]);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  // Real-time connection
  const { data, isConnected, error } = useRealtime({
    events: [
      REALTIME_EVENTS.QUEST_CREATED,
      REALTIME_EVENTS.QUEST_UPDATED,
      REALTIME_EVENTS.QUEST_COMPLETED,
    ],
    enabled: true,
    onConnected: () => addLog('✅ Connected to real-time updates'),
    onDisconnected: () => addLog('❌ Disconnected from real-time updates'),
  });

  // Polling fallback
  const { quests: polledQuests, refetch } = useQuestPolling({
    interval: 5000,
    enabled: !isConnected,
  });

  // Handle real-time events
  useEffect(() => {
    if (data) {
      addLog(`📡 Event received: ${data.type}`);
      
      if (data.type === REALTIME_EVENTS.QUEST_CREATED) {
        setQuests(prev => [data.quest, ...prev]);
        addLog(`🎉 New quest: ${data.quest.title}`);
      }
      
      if (data.type === REALTIME_EVENTS.QUEST_UPDATED) {
        setQuests(prev => prev.map(q => q._id === data.quest._id ? data.quest : q));
        addLog(`✏️ Quest updated: ${data.quest.title}`);
      }
      
      if (data.type === REALTIME_EVENTS.QUEST_COMPLETED) {
        addLog(`✅ Quest completed! ${data.pointsEarned} points`);
      }
    }
  }, [data]);

  // Use polled quests if not connected
  useEffect(() => {
    if (!isConnected && polledQuests.length > 0) {
      setQuests(polledQuests);
      addLog(`📊 Fetched ${polledQuests.length} quests via polling`);
    }
  }, [isConnected, polledQuests]);

  // Initial fetch
  useEffect(() => {
    fetch('/api/quests')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuests(data.quests);
          addLog(`📊 Initial fetch: ${data.quests.length} quests`);
        }
      })
      .catch(err => addLog(`❌ Error: ${err.message}`));
  }, []);

  // Test create quest
  const createTestQuest = async () => {
    try {
      addLog('🔄 Creating test quest...');
      const response = await fetch('/api/quests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Test Quest ${Date.now()}`,
          description: 'This is a real-time test quest',
          coordinates: [-122.4194, 37.7749],
          address: 'San Francisco, CA',
          category: 'cleanup',
          impactPoints: 50,
          verificationPrompt: 'Show cleanup activity',
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        addLog(`✅ Quest created: ${data.quest.title}`);
      } else {
        addLog(`❌ Failed to create quest: ${data.error}`);
      }
    } catch (error: any) {
      addLog(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Real-time Test Page</h1>
        
        {/* Status Bar */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`h-4 w-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <span className="font-medium">
                {isConnected ? '🔄 Real-time Active' : '⏱️ Polling Mode'}
              </span>
            </div>
            <button
              onClick={createTestQuest}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Test Quest
            </button>
          </div>
          {error && (
            <div className="mt-2 text-sm text-red-600">
              Error: {error.message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Event Logs */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Event Logs</h2>
            <div className="space-y-1 text-sm font-mono">
              {logs.length === 0 ? (
                <div className="text-gray-400">No events yet...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-gray-700 border-b border-gray-100 py-1">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quest List */}
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="text-xl font-bold mb-4">Quests ({quests.length})</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {quests.length === 0 ? (
                <div className="text-gray-400">No quests yet...</div>
              ) : (
                quests.map((quest) => (
                  <div key={quest._id} className="border border-gray-200 rounded p-3">
                    <div className="font-semibold">{quest.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{quest.description}</div>
                    <div className="flex gap-2 mt-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {quest.impactPoints} pts
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {quest.category}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-bold mb-2">🧪 Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>Check if the connection indicator shows "Real-time Active" (green)</li>
            <li>Click "Create Test Quest" to create a new quest</li>
            <li>Watch the Event Logs to see if the quest creation event is received immediately</li>
            <li>The quest should appear in the list instantly (real-time) or within 5 seconds (polling)</li>
            <li>Open this page in another browser tab and create a quest - both tabs should update</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
