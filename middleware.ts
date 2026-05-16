// Payment gating is handled per-route via withX402 (see app/api/feed/*/route.ts)
// to avoid exceeding the 1MB Edge Function size limit.
export {};

export const config = {
  matcher: [],
};
