import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";
import { nl } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, fmt = "d MMMM yyyy") {
  return format(new Date(date), fmt, { locale: nl });
}

export function formatTime(date: Date | string) {
  return format(new Date(date), "HH:mm", { locale: nl });
}

export function formatRelative(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: nl });
}

export function formatDateTime(date: Date | string) {
  return format(new Date(date), "d MMM • HH:mm", { locale: nl });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function getStatusColor(status: string) {
  switch (status) {
    case "ingecheckt": return "bg-green-100 text-green-700 border-green-200";
    case "aangemeld":  return "bg-orange-100 text-orange-700 border-orange-200";
    case "afwezig":    return "bg-gray-100 text-gray-500 border-gray-200";
    case "live":       return "bg-terra-100 text-terra-700 border-terra-200";
    case "published":  return "bg-green-100 text-green-700 border-green-200";
    case "draft":      return "bg-gray-100 text-gray-500 border-gray-200";
    default:           return "bg-gray-100 text-gray-500 border-gray-200";
  }
}

export function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    ingecheckt: "Ingecheckt",
    aangemeld:  "Aangemeld",
    afwezig:    "Afwezig",
    live:       "Live",
    published:  "Actief",
    draft:      "Concept",
    ended:      "Afgelopen",
  };
  return labels[status] ?? status;
}

export function avatarColor(name: string): string {
  const colors = [
    "bg-terra-500", "bg-green-500", "bg-blue-500",
    "bg-purple-500", "bg-amber-500", "bg-rose-500",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

export function calculateAttendanceRate(checked: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((checked / total) * 100);
}
