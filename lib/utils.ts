import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** Prefix a public asset with the GitHub Pages base path. */
export function asset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalized}`;
}

export function initials(name: string): string {
  const cleaned = name.trim();
  if (!cleaned) return "?";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function parseDate(value: string): Date {
  return new Date(value.length === 10 ? `${value}T12:00:00+08:00` : value);
}

export function daysBetween(from: string, to: string): number {
  const a = parseDate(from);
  const b = parseDate(to);
  const aDay = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const bDay = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((bDay - aDay) / 86_400_000);
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function uid(prefix = "id"): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function truncate(value: string, length: number): string {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}
