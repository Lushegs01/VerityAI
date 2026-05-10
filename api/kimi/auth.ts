import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { randomBytes } from "node:crypto";
import * as jose from "jose";
import * as cookie from "cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Paths, Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "./session";
import { findUserByUnionId, upsertUser } from "../queries/users";
import type { TokenResponse } from "./types";

const OAUTH_STATE_COOKIE = "oauth_state";
const OAUTH_NONCE_COOKIE = "oauth_nonce";
const GOOGLE_ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const googleJwks = jose.createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs"),
);

type GoogleIdTokenPayload = jose.JWTPayload & {
  sub?: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  nonce?: string;
};

function randomToken() {
  return randomBytes(32).toString("base64url");
}

function getRedirectUri(c: Context) {
  const url = new URL(c.req.url);
  const forwardedProto = c.req.header("x-forwarded-proto");
  if (forwardedProto) {
    url.protocol = forwardedProto;
  } else if (env.isProduction) {
    url.protocol = "https:";
  }
  return `${url.origin}${Paths.oauthCallback}`;
}

function getGoogleOAuthUrl(redirectUri: string, state: string, nonce: string) {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", env.googleClientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "openid email profile");
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  return url.toString();
}

async function exchangeAuthCode(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: env.googleClientId,
    redirect_uri: redirectUri,
    client_secret: env.googleClientSecret,
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Token exchange failed (${resp.status}): ${text}`);
  }

  return resp.json() as Promise<TokenResponse>;
}

async function verifyGoogleIdToken(
  idToken: string,
  nonce: string,
): Promise<GoogleIdTokenPayload & { sub: string; email: string }> {
  const { payload } = await jose.jwtVerify(idToken, googleJwks, {
    audience: env.googleClientId,
    issuer: GOOGLE_ISSUERS,
  });

  const googlePayload = payload as GoogleIdTokenPayload;
  if (!googlePayload.sub || !googlePayload.email) {
    throw new Error("Google ID token is missing required identity claims");
  }
  if (googlePayload.nonce !== nonce) {
    throw new Error("Google ID token nonce mismatch");
  }
  if (googlePayload.email_verified === false) {
    throw new Error("Google account email is not verified");
  }

  return googlePayload as GoogleIdTokenPayload & { sub: string; email: string };
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}

export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    const code = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");
    const errorDescription = c.req.query("error_description");

    if (error) {
      if (error === "access_denied") {
        return c.redirect("/", 302);
      }
      return c.json(
        { error, error_description: errorDescription },
        400,
      );
    }

    if (!code || !state) {
      return c.json({ error: "code and state are required" }, 400);
    }

    const expectedState = getCookie(c, OAUTH_STATE_COOKIE);
    const expectedNonce = getCookie(c, OAUTH_NONCE_COOKIE);
    if (!expectedState || !expectedNonce || state !== expectedState) {
      return c.json({ error: "Invalid OAuth state" }, 400);
    }

    try {
      const redirectUri = getRedirectUri(c);
      const tokenResp = await exchangeAuthCode(code, redirectUri);

      const idToken = tokenResp.id_token;
      if (!idToken) throw new Error("No id_token in response");

      const payload = await verifyGoogleIdToken(idToken, expectedNonce);
      const userId = payload.sub;
      const email = payload.email;
      const name = payload.name ?? email;
      const picture = payload.picture ?? null;

      await upsertUser({
        unionId: userId,
        email,
        name,
        avatar: picture,
        lastSignInAt: new Date(),
      });

      const token = await signSessionToken({
        unionId: userId,
        clientId: env.googleClientId,
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });
      deleteCookie(c, OAUTH_STATE_COOKIE, { path: "/" });
      deleteCookie(c, OAUTH_NONCE_COOKIE, { path: "/" });

      return c.redirect("/dashboard", 302);
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

export function createOAuthStartHandler() {
  return async (c: Context) => {
    if (!env.googleClientId || !env.googleClientSecret) {
      return c.json({ error: "Google OAuth is not configured" }, 500);
    }

    const state = randomToken();
    const nonce = randomToken();
    const redirectUri = getRedirectUri(c);
    const cookieOpts = {
      ...getSessionCookieOptions(c.req.raw.headers),
      sameSite: "Lax" as const,
      maxAge: 10 * 60,
    };

    setCookie(c, OAUTH_STATE_COOKIE, state, cookieOpts);
    setCookie(c, OAUTH_NONCE_COOKIE, nonce, cookieOpts);

    return c.redirect(getGoogleOAuthUrl(redirectUri, state, nonce), 302);
  };
}

export { exchangeAuthCode, verifyGoogleIdToken };
