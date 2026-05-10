export const Session = {
  cookieName: "auth_sid",
  maxAgeMs: 365 * 24 * 60 * 60 * 1000,
} as const;

export const ErrorMessages = {
  unauthenticated: "Authentication required",
  insufficientRole: "Insufficient permissions",
} as const;

export const Paths = {
  login: "/login",
  oauthStart: "/api/oauth/google",
  oauthCallback: "/api/oauth/callback",
  health: "/api/health",
} as const;
