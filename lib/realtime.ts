/**
 * Real-time event emitter for server-side events
 * This manages SSE connections and broadcasts updates
 */

type Listener = (data: any) => void;

class RealtimeManager {
  private listeners: Map<string, Set<Listener>> = new Map();
  private lastUpdate: Map<string, number> = new Map();

  subscribe(event: string, callback: Listener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.unsubscribe(event, callback);
    };
  }

  unsubscribe(event: string, callback: Listener) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit(event: string, data: any) {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
    this.lastUpdate.set(event, Date.now());
  }

  getLastUpdate(event: string): number {
    return this.lastUpdate.get(event) || 0;
  }

  hasListeners(event: string): boolean {
    return (this.listeners.get(event)?.size || 0) > 0;
  }

  getListenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }
}

// Singleton instance
const realtimeManager = new RealtimeManager();

export default realtimeManager;

// Event types
export const REALTIME_EVENTS = {
  QUEST_CREATED: 'quest:created',
  QUEST_UPDATED: 'quest:updated',
  QUEST_COMPLETED: 'quest:completed',
  USER_UPDATED: 'user:updated',
  SUBMISSION_CREATED: 'submission:created',
  SUBMISSION_VERIFIED: 'submission:verified',
} as const;
