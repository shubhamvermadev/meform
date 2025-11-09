/**
 * Simple in-memory session store
 * In production, use Redis or a database
 * 
 * Uses globalThis to persist across Next.js hot reloads in development
 */

interface SessionData {
  userId: string;
  email: string;
  createdAt: number;
}

const globalForSessions = globalThis as unknown as {
  sessions: Map<string, SessionData> | undefined;
};

// Use existing sessions Map or create new one
// This persists across Next.js hot reloads
const sessions =
  globalForSessions.sessions ?? new Map<string, SessionData>();

if (!globalForSessions.sessions) {
  globalForSessions.sessions = sessions;
}

const SESSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Stores a session
 */
export function storeSession(sessionId: string, userId: string, email: string): void {
  sessions.set(sessionId, {
    userId,
    email,
    createdAt: Date.now(),
  });
}

/**
 * Gets session data
 */
export function getSessionData(sessionId: string): SessionData | null {
  const data = sessions.get(sessionId);
  if (!data) {
    return null;
  }

  // Check if expired
  if (Date.now() - data.createdAt > SESSION_TTL) {
    sessions.delete(sessionId);
    return null;
  }

  return data;
}

/**
 * Deletes a session
 */
export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

/**
 * Cleanup expired sessions (call periodically)
 */
export function cleanupExpiredSessions(): void {
  const now = Date.now();
  for (const [sessionId, data] of sessions.entries()) {
    if (now - data.createdAt > SESSION_TTL) {
      sessions.delete(sessionId);
    }
  }
}

// Cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredSessions, 60 * 60 * 1000);
}

