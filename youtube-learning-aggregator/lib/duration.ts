const ISO_8601_DURATION =
  /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/;

export function parseIsoDuration(duration: string): number {
  const match = ISO_8601_DURATION.exec(duration);
  if (!match) return 0;
  const [, hours, minutes, seconds] = match;
  return (
    (Number(hours) || 0) * 3600 +
    (Number(minutes) || 0) * 60 +
    (Number(seconds) || 0)
  );
}
