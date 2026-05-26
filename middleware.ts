// Payment gating is handled per-route via withX402 (@x402/next v2).
// This no-op middleware intentionally matches nothing.
export function middleware() {}

export const config = { matcher: [] };
