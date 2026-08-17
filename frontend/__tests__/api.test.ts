import { beforeEach, describe, expect, it, vi } from "vitest";
import { getToken, setToken } from "@/lib/api";

describe("token storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("persists the token in localStorage", () => {
    setToken("test-token-123");
    expect(window.localStorage.getItem("bek_token")).toBe("test-token-123");
    expect(getToken()).toBe("test-token-123");
  });

  it("removes the token from localStorage when cleared", () => {
    setToken("test-token-123");
    setToken(null);
    expect(window.localStorage.getItem("bek_token")).toBeNull();
    expect(getToken()).toBeNull();
  });
});

describe("api error handling", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  it("throws the API message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ message: "Invalid credentials." }),
      }),
    );

    const { api } = await import("@/lib/api");

    await expect(api.login({ email: "a@b.com", password: "wrong" })).rejects.toThrow(
      "Invalid credentials.",
    );
  });

  it("includes the bearer token in authenticated requests", async () => {
    setToken("bearer-token");
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ data: { notifications: { data: [] }, unread_count: 0 } }) });
    vi.stubGlobal("fetch", fetchMock);

    const { api } = await import("@/lib/api");
    await api.notifications();

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/v1/notifications");
    expect(options.headers.Authorization).toBe("Bearer bearer-token");
  });
});
