"use client";

import { useEffect, useRef, useState } from "react";
import { getPusherClient, getEventChannel, PUSHER_EVENTS } from "@/lib/pusher";
import { Users, Activity, MessageCircle, Star, TrendingUp } from "lucide-react";

interface LiveData {
  totalRegistered: number;
  checkedIn:       number;
  recentQA:        number;
  totalPoints:     number;
  timeline:        { time: string; count: number }[];
}

interface Props {
  eventId:      string;
  primaryColor: string;
}

export function LiveStats({ eventId, primaryColor }: Props) {
  const [data,    setData]    = useState<LiveData | null>(null);
  const [pulse,   setPulse]   = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function refresh() {
    const res = await fetch(`/api/analytics/live?eventId=${eventId}`);
    if (res.ok) {
      setData(await res.json());
    }
  }

  useEffect(() => {
    refresh();
    // Poll every 30 seconds as fallback
    intervalRef.current = setInterval(refresh, 30_000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [eventId]);

  // Pusher: update checkedIn count on each check-in event
  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const ch = pusher.subscribe(getEventChannel(eventId));
    ch.bind(PUSHER_EVENTS.ATTENDEE_CHECKIN, () => {
      setPulse(true);
      setTimeout(() => setPulse(false), 1000);
      setData(prev => prev ? { ...prev, checkedIn: prev.checkedIn + 1 } : prev);
    });

    return () => pusher.unsubscribe(getEventChannel(eventId));
  }, [eventId]);

  if (!data) {
    return (
      <div className="grid grid-cols-2 gap-3 animate-pulse">
        {[0,1,2,3].map(i => (
          <div key={i} className="h-20 bg-gray-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  const checkinPct = data.totalRegistered > 0
    ? Math.round((data.checkedIn / data.totalRegistered) * 100)
    : 0;

  const maxBucket = data.timeline.length > 0
    ? Math.max(...data.timeline.map(b => b.count))
    : 1;

  return (
    <div className="space-y-3">
      {/* Live KPI row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Check-in counter — pulses on Pusher events */}
        <div
          className={`rounded-2xl p-4 text-white transition-all duration-300 ${pulse ? "scale-105" : ""}`}
          style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
            <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Live aanwezig</p>
          </div>
          <p className="text-3xl font-extrabold tabular-nums">{data.checkedIn}</p>
          <p className="text-white/70 text-xs mt-0.5">
            van {data.totalRegistered} · {checkinPct}%
          </p>
          {/* Mini progress bar */}
          <div className="mt-2 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/70 rounded-full transition-all duration-500"
              style={{ width: `${checkinPct}%` }}
            />
          </div>
        </div>

        {/* Total points */}
        <div className="rounded-2xl p-4 bg-amber-50 border border-amber-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Star size={11} className="text-amber-500" />
            <p className="text-[10px] font-bold text-amber-600/70 uppercase tracking-wider">Punten verdiend</p>
          </div>
          <p className="text-3xl font-extrabold tabular-nums text-amber-700">{data.totalPoints}</p>
          <p className="text-amber-600/70 text-xs mt-0.5">door alle deelnemers</p>
        </div>
      </div>

      {/* Activity row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4 bg-blue-50 border border-blue-100">
          <div className="flex items-center gap-1.5 mb-1">
            <MessageCircle size={11} className="text-blue-500" />
            <p className="text-[10px] font-bold text-blue-500/70 uppercase tracking-wider">Recente Q&A</p>
          </div>
          <p className="text-2xl font-extrabold tabular-nums text-blue-700">{data.recentQA}</p>
          <p className="text-blue-500/70 text-xs mt-0.5">vragen (laatste 10 min)</p>
        </div>

        <div className="rounded-2xl p-4 bg-green-50 border border-green-100">
          <div className="flex items-center gap-1.5 mb-1">
            <Activity size={11} className="text-green-500" />
            <p className="text-[10px] font-bold text-green-500/70 uppercase tracking-wider">Conversie</p>
          </div>
          <p className="text-2xl font-extrabold tabular-nums text-green-700">{checkinPct}%</p>
          <p className="text-green-500/70 text-xs mt-0.5">opkomstpercentage</p>
        </div>
      </div>

      {/* Check-in timeline */}
      {data.timeline.length > 0 && (
        <div className="rounded-2xl bg-white border border-sand p-4">
          <div className="flex items-center gap-1.5 mb-3">
            <TrendingUp size={13} className="text-ink-muted" />
            <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">
              Aankomst tijdlijn (per kwartier)
            </p>
          </div>
          <div className="flex items-end gap-1 h-14">
            {data.timeline.map(bucket => (
              <div key={bucket.time} className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height:           `${Math.max(4, (bucket.count / maxBucket) * 48)}px`,
                    backgroundColor:  primaryColor,
                    opacity:          0.7 + 0.3 * (bucket.count / maxBucket),
                  }}
                  title={`${bucket.time}: ${bucket.count}`}
                />
                <p className="text-[8px] text-ink-muted/60 truncate w-full text-center">
                  {bucket.time}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
