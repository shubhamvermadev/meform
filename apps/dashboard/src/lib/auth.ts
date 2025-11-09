import { cookies } from "next/headers";
import { COOKIE_NAMES } from "@meform/config";
import { nanoid } from "nanoid";
import { prisma } from "@meform/db";
import bcrypt from "bcrypt";
import { storeSession, getSessionData, deleteSession } from "./session-store";

/**
 * Session management utilities
 */

export interface Session {
  id: string;
  userId: string;
  email: string;
}

/**
 * Creates a new session
 */
export async function createSession(userId: string, email: string): Promise<string> {
  const sessionId = nanoid();
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAMES.SESSION, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
    domain: undefined, // Let browser set domain
  });

  // Store session data
  storeSession(sessionId, userId, email);

  return sessionId;
}

/**
 * Gets the current session
 */
export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(COOKIE_NAMES.SESSION);
    const sessionId = sessionCookie?.value;

    if (!sessionId) {
      console.log("No session cookie found");
      return null;
    }

    const sessionData = getSessionData(sessionId);
    if (!sessionData) {
      console.log("Session data not found for sessionId:", sessionId);
      return null;
    }

    return {
      id: sessionId,
      userId: sessionData.userId,
      email: sessionData.email,
    };
  } catch (error) {
    // Handle case where cookies() might fail
    console.error("Error getting session:", error);
    return null;
  }
}

/**
 * Destroys the current session
 */
export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(COOKIE_NAMES.SESSION)?.value;
  if (sessionId) {
    deleteSession(sessionId);
  }
  cookieStore.delete(COOKIE_NAMES.SESSION);
}

/**
 * Verifies password
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Hashes password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Gets the current authenticated user
 */
export async function getCurrentUser(): Promise<{ id: string; email: string } | null> {
  const session = await getSession();
  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { id: true, email: true },
  });

  return user;
}

