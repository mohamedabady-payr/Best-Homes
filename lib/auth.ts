"use client";

import bcrypt from "bcryptjs";

const USERS_KEY = "best_homes_users";
const SESSION_KEY = "best_homes_session";

export interface User {
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
}

export interface Session {
  email: string;
}

function getUsers(): Record<string, User> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setUsers(users: Record<string, User>): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getCurrentUser(): { email: string; firstName: string; lastName: string } | null {
  const session = getSession();
  if (!session) return null;
  const users = getUsers();
  const user = users[session.email.trim().toLowerCase()];
  if (!user) return null;
  return { email: user.email, firstName: user.firstName, lastName: user.lastName };
}

function setSession(session: Session | null): void {
  if (typeof window === "undefined") return;
  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function register(params: {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}): { ok: true } | { ok: false; error: string } {
  const users = getUsers();
  const emailLower = params.email.trim().toLowerCase();
  if (users[emailLower]) {
    return { ok: false, error: "Email already registered" };
  }
  const passwordHash = bcrypt.hashSync(params.password, 10);
  users[emailLower] = {
    email: params.email.trim(),
    firstName: params.firstName.trim(),
    lastName: params.lastName.trim(),
    passwordHash,
  };
  setUsers(users);
  setSession({ email: params.email.trim() });
  return { ok: true };
}

export function login(params: { email: string; password: string }): { ok: true } | { ok: false; error: string } {
  const users = getUsers();
  const emailLower = params.email.trim().toLowerCase();
  const user = users[emailLower];
  if (!user) {
    return { ok: false, error: "Not authorized" };
  }
  if (!bcrypt.compareSync(params.password, user.passwordHash)) {
    return { ok: false, error: "Not authorized" };
  }
  setSession({ email: user.email });
  return { ok: true };
}

export function logout(): void {
  setSession(null);
}
