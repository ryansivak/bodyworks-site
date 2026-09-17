// Body Works only. Unconfirmed operating values remain null; fixtures cannot enable bookings.
export const business = Object.freeze({
  id: 'body-works', mode: 'preview', services: [], timezone: null,
  weeklyHours: null, exceptions: [], bufferMinutes: null, leadHours: null,
  bookingHorizonDays: null, location: null, approvalPolicy: null,
  contactChannel: null, cancellationPolicy: null,
});
export const demo = Object.freeze({
  label: 'Fictional demonstration',
  timezone: 'America/New_York',
  services: [{ id: 'sample-short', label: 'Sample appointment · 30 minutes', minutes: 30 },
    { id: 'sample-long', label: 'Sample appointment · 60 minutes', minutes: 60 }],
  open: 600, close: 780, buffer: 15,
  busy: [[660, 720]],
});
export function slotsFor(minutes, busy = demo.busy) {
  if (!Number.isInteger(minutes) || minutes <= 0) return [];
  const result = [];
  for (let start = demo.open; start + minutes + demo.buffer <= demo.close; start += 15) {
    if (!busy.some(([from, to]) => start < to + demo.buffer && start + minutes + demo.buffer > from)) result.push(start);
  }
  return result;
}
