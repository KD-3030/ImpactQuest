import { NextRequest, NextResponse } from 'next/server';
import realtimeManager, { REALTIME_EVENTS } from '@/lib/realtime';

/**
 * Server-Sent Events (SSE) endpoint for real-time updates
 * Clients can subscribe to different event streams
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const events = searchParams.get('events')?.split(',') || Object.values(REALTIME_EVENTS);

  // Create a readable stream for SSE
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({ 
        type: 'connected', 
        events,
        timestamp: Date.now() 
      })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));

      // Subscribe to all requested events
      const unsubscribers: (() => void)[] = [];

      events.forEach((event) => {
        const unsubscribe = realtimeManager.subscribe(event, (data) => {
          try {
            const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
            controller.enqueue(encoder.encode(message));
          } catch (error) {
            console.error('Error sending SSE message:', error);
          }
        });
        unsubscribers.push(unsubscribe);
      });

      // Send heartbeat every 30 seconds to keep connection alive
      const heartbeat = setInterval(() => {
        try {
          const message = `event: heartbeat\ndata: ${JSON.stringify({ timestamp: Date.now() })}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (error) {
          console.error('Error sending heartbeat:', error);
          clearInterval(heartbeat);
        }
      }, 30000);

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        unsubscribers.forEach((unsubscribe) => unsubscribe());
        controller.close();
      });
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx
    },
  });
}
