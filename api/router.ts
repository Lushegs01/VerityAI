import { authRouter } from "./auth-router"
import { dashboardRouter } from "./dashboard-router"
import { verificationRouter } from "./verification-router"
import { walletRouter } from "./wallet-router"
import { publicRouter } from "./public-router"
import { createRouter, publicQuery } from "./middleware"

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  dashboard: dashboardRouter,
  verification: verificationRouter,
  wallet: walletRouter,
  public: publicRouter,
})

export type AppRouter = typeof appRouter
