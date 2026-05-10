import * as cookie from "cookie"
import { Session } from "@contracts/constants"
import { getSessionCookieOptions } from "./lib/cookies"
import { createRouter, authedQuery, publicQuery } from "./middleware"
import { getDb } from "./queries/connection"
import { users } from "../db/schema"
import { eq } from "drizzle-orm"

export const authRouter = createRouter({
  me: authedQuery.query((opts) => opts.ctx.user),

  getExtendedUser: publicQuery.query(async () => {
    // For demo purposes, return the seeded demo user
    const db = getDb()
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, "demo@verity.ng"))
      .limit(1)

    if (user[0]) {
      return {
        id: user[0].id,
        fullName: user[0].fullName,
        companyName: user[0].companyName,
        walletBalance: user[0].walletBalance,
        plan: user[0].plan,
        verificationCount: user[0].verificationCount,
      }
    }

    return null
  }),

  logout: authedQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers)
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    )
    return { success: true }
  }),
})
