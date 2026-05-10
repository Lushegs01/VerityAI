import { describe, expect, it } from "vitest";
import { appRouter } from "./router";
import type { TrpcContext } from "./context";

describe("appRouter", () => {
  it("responds to ping", async () => {
    const ctx: TrpcContext = {
      req: new Request("http://localhost/api/trpc/ping"),
      resHeaders: new Headers(),
    };
    const caller = appRouter.createCaller(ctx);

    await expect(caller.ping()).resolves.toMatchObject({ ok: true });
  });
});
