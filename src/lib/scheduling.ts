/**
 * LifeScript — randomized delivery scheduling.
 *
 * Reports are never emailed the instant they're ready — that signals
 * "AI-made" and cheapens the product. Instead each report is queued for a
 * randomized 6–18h delay so it feels human-prepared, but never lands at
 * night (clamped to 8am–10pm IST).
 */
import "server-only";

const IST_OFFSET_MIN = 5.5 * 60;
const MIN_DELAY_HOURS = 6;
const MAX_DELAY_HOURS = 18;
const DAY_START_HOUR = 8; // IST
const DAY_END_HOUR = 22; // IST

/** Pick a randomized send time, pushed into the next daytime window if needed. */
export function scheduleDelayedDelivery(now = new Date()): Date {
  const delayHours = MIN_DELAY_HOURS + Math.random() * (MAX_DELAY_HOURS - MIN_DELAY_HOURS);
  let candidate = new Date(now.getTime() + delayHours * 60 * 60 * 1000);

  const istHour = (date: Date) => {
    const istMinutes = (date.getTime() / 60000 + IST_OFFSET_MIN) % (24 * 60);
    return istMinutes / 60;
  };

  let hour = istHour(candidate);
  if (hour < DAY_START_HOUR || hour >= DAY_END_HOUR) {
    // Push to the same day's 8am–10pm window (next day if we've already passed it).
    const istMs = candidate.getTime() + IST_OFFSET_MIN * 60 * 1000;
    const istDate = new Date(istMs);
    istDate.setUTCHours(DAY_START_HOUR, Math.floor(Math.random() * 60), 0, 0);
    if (hour >= DAY_END_HOUR) istDate.setUTCDate(istDate.getUTCDate() + 1);
    candidate = new Date(istDate.getTime() - IST_OFFSET_MIN * 60 * 1000);
  }

  return candidate;
}
