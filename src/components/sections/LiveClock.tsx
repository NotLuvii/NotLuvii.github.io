"use client";

import { useSyncExternalStore } from "react";
import { formatClock } from "@/lib/clock";

// A tick every 30 seconds is enough to keep the minutes right.
const subscribe = (onTick: () => void) => {
  const id = setInterval(onTick, 30_000);
  return () => clearInterval(id);
};
const now = () => formatClock(new Date());
const notYet = () => null;

/**
 * Where I am, and the time there. The page is built ahead of time, so the time is added in the
 * browser; without JavaScript only the city shows.
 */
export function LiveClock({ city }: { city: string }) {
  const time = useSyncExternalStore(subscribe, now, notYet);
  return (
    <p data-clock className="type-small text-text-3">
      {city}
      {time && ` · ${time}`}
    </p>
  );
}
