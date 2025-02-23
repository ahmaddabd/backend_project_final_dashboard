import { registerAs } from "@nestjs/config";

export default registerAs("jwt", () => ({
  secret: process.env.JWT_SECRET || "super-secret",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "super-refresh-secret",
  expiresIn: process.env.JWT_EXPIRATION || "1h",
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRATION || "7d",
  issuer: process.env.JWT_ISSUER || "backend-dashboard",
  audience: process.env.JWT_AUDIENCE || "dashboard-users",
  algorithm: process.env.JWT_ALGORITHM || "HS256",
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL
    ? parseInt(process.env.REFRESH_TOKEN_TTL, 10)
    : 7 * 24 * 60 * 60, // 7 days in seconds
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL
    ? parseInt(process.env.ACCESS_TOKEN_TTL, 10)
    : 60 * 60, // 1 hour in seconds
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    domain: process.env.COOKIE_DOMAIN || "localhost",
    path: "/",
  },
}));
