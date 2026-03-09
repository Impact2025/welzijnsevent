import Pusher from "pusher";
import PusherJS from "pusher-js";

const hasPusherServer =
  !!process.env.PUSHER_APP_ID &&
  !!process.env.PUSHER_KEY &&
  !!process.env.PUSHER_SECRET;

const hasPusherClient =
  !!process.env.NEXT_PUBLIC_PUSHER_KEY &&
  !!process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

// Server-side Pusher (null-safe — no-op when not configured)
const _pusherServer = hasPusherServer
  ? new Pusher({
      appId:   process.env.PUSHER_APP_ID!,
      key:     process.env.PUSHER_KEY!,
      secret:  process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER ?? "eu",
      useTLS:  true,
    })
  : null;

export const pusherServer = {
  trigger: async (channel: string, event: string, data: unknown) => {
    if (!_pusherServer) return;
    return _pusherServer.trigger(channel, event, data);
  },
};

// Client-side Pusher
export const getPusherClient = () => {
  if (!hasPusherClient) return null;
  return new PusherJS(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  });
};

// Channel helpers
export const getEventChannel = (eventId: string) => `event-${eventId}`;
export const getLiveChannel  = (eventId: string) => `live-${eventId}`;

// Events
export const PUSHER_EVENTS = {
  QA_NEW:       "qa:new",
  QA_UPDATED:   "qa:updated",
  POLL_UPDATED: "poll:updated",
  ATTENDEE_CHECKIN: "attendee:checkin",
  SESSION_STARTED:  "session:started",
  SESSION_ENDED:    "session:ended",
} as const;
