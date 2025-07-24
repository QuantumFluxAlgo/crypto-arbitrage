import request from "supertest";
import { jest } from "@jest/globals";
import logger from "../services/logger.js";

const describeLocal =
  process.env.TEST_ENV === "local" || !process.env.TEST_ENV
    ? describe
    : describe.skip;
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "testsecret";
process.env.SANDBOX_MODE = "true";
let buildApp;
let app;
let cookie;
let warnSpy;

beforeAll(async () => {
  ({ buildApp } = await import("../index.js"));
  app = await buildApp();
  await app.listen({ port: 0 });
  const login = await request(app.server)
    .post("/api/login")
    .send({ email: "user", password: "pass" });
  cookie = login.headers["set-cookie"][0].split(";")[0];
});

afterAll(async () => {
  await app.close();
});

beforeEach(() => {
  warnSpy = jest.spyOn(logger, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warnSpy.mockRestore();
});

describeLocal("settings validation", () => {
  test("rejects unknown properties", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({ evil: true });
    expect(res.statusCode).toBe(400);
  });

  test("rejects incorrect types", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({ ghost_mode: "true" });
    expect(res.statusCode).toBe(400);
  });

  test("rejects invalid sweep_cadence values", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({ sweep_cadence: "Weekly" });
    expect(res.statusCode).toBe(400);
  });

  test("forced sandbox_mode cannot be disabled", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({ sandbox_mode: false });
    expect(res.statusCode).toBe(200);

    const verify = await request(app.server)
      .get("/api/settings")
      .set("Cookie", cookie);
    expect(verify.body.sandbox_mode).toBe(true);
  });

  test("rejects unsafe maxLossPct", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({ maxLossPct: 150 });
    expect(res.statusCode).toBe(400);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("field=maxLossPct"),
    );
  });

  test("rejects unsafe latencyMaxMs", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({ latencyMaxMs: 9999 });
    expect(res.statusCode).toBe(400);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("field=latencyMaxMs"),
    );
  });

  test("rejects unsafe exposureCapPct", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({ exposureCapPct: 150 });
    expect(res.statusCode).toBe(400);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("field=exposureCapPct"),
    );
  });

  test("rejects invalid mode", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({ mode: "WRONG" });
    expect(res.statusCode).toBe(400);
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("field=mode"),
    );
  });

  test("rejects malformed sweep_cadence", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({ sweep_cadence: "dailyX" });
    expect(res.statusCode).toBe(400);
  });

  test("accepts valid payload", async () => {
    const res = await request(app.server)
      .patch("/api/settings")
      .set("Cookie", cookie)
      .send({
        mode: "AUTO",
        maxLossPct: 10,
        latencyMaxMs: 500,
        exposureCapPct: 20,
        sweep_cadence: "Daily",
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ saved: true });
  });
});
