declare function gtag(...args: unknown[]): void;

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
) {
  if (typeof window === "undefined") return;
  if (typeof gtag === "undefined") return;
  gtag("event", eventName, params);
}
