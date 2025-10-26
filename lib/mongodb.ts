import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second socket timeout
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then(async (mongoose) => {
      console.log('✅ MongoDB connected successfully');
      
      // Initialize change streams if supported
      if (process.env.NODE_ENV === 'production' || process.env.ENABLE_CHANGE_STREAMS === 'true') {
        try {
          const { initializeChangeStreams, supportsChangeStreams } = await import('./changeStreams');
          const supported = await supportsChangeStreams();
          
          if (supported) {
            await initializeChangeStreams();
          } else {
            console.warn('⚠️ MongoDB change streams not supported (requires replica set)');
            console.warn('📡 Using manual event emission in API routes');
          }
        } catch (error) {
          console.error('Failed to initialize change streams:', error);
        }
      }
      
      return mongoose;
    }).catch((error) => {
      console.error('❌ MongoDB connection failed:', error.message);
      cached.promise = null; // Clear promise so it can retry
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('❌ MongoDB connection error:', e.message);
    throw new Error(`Database connection failed: ${e.message}`);
  }

  return cached.conn;
}

export default dbConnect;
