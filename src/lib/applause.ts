export const APPLAUSE_BASE_COUNT = 157452;

// Establish the requested starting total without resetting claps already above it.
// Seeding and incrementing happen in one Redis operation, including concurrent requests.
export const APPLAUSE_COUNT_SCRIPT = `
local current = tonumber(redis.call('GET', KEYS[1])) or 0
local baseline = tonumber(ARGV[1])
if current < baseline then current = baseline end
if ARGV[2] == '1' then current = current + 1 end
redis.call('SET', KEYS[1], current)
return current
`;
export function deviceApplauseTotal(additional: number): number {
  const valid = Number.isSafeInteger(additional) && additional >= 0 ? additional : 0;
  return Math.min(Number.MAX_SAFE_INTEGER, APPLAUSE_BASE_COUNT + valid);
}
