import { expect, test, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAutoRefreshJWT } from "../hooks/useAutoRefreshJWT";
import { account } from "@/app/appwrite";

// Mock the account module
vi.mock("@/app/appwrite", () => ({
  account: {
    get: vi.fn(),
    createJWT: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("useAutoRefreshJWT hook", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    localStorageMock.clear();

    // Mock console.log to avoid cluttering the test output
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test("should refresh JWT when user is logged in", async () => {
    // Mock successful user session
    account.get.mockResolvedValue({ $id: "user-id", name: "Test User" });
    account.createJWT.mockResolvedValue({ jwt: "mock-jwt-token" });

    // Use fake timers to control setTimeout and setInterval
    vi.useFakeTimers();

    // Render the hook
    renderHook(() => useAutoRefreshJWT());

    // Wait for the initial effect to run
    await vi.runAllTimersAsync();

    // Verify initial JWT was set
    expect(account.get).toHaveBeenCalledTimes(1);
    expect(account.createJWT).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledWith("jwt", "mock-jwt-token");

    // Fast forward 15 minutes to trigger the interval refresh
    vi.advanceTimersByTime(15 * 60 * 1000);

    // Verify JWT was refreshed
    expect(account.createJWT).toHaveBeenCalledTimes(2);
    expect(localStorage.setItem).toHaveBeenCalledTimes(2);

    // Restore real timers
    vi.useRealTimers();
  });

  test("should not refresh JWT when user is not logged in", async () => {
    // Mock failed user session
    account.get.mockRejectedValue(new Error("User not authenticated"));

    // Render the hook
    renderHook(() => useAutoRefreshJWT());

    // Wait for promises to resolve
    await vi.runAllTimersAsync();

    // Verify JWT was not set
    expect(account.get).toHaveBeenCalledTimes(1);
    expect(account.createJWT).not.toHaveBeenCalled();
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  test("should handle JWT refresh failure", async () => {
    // Mock successful user session but failed JWT refresh
    account.get.mockResolvedValue({ $id: "user-id", name: "Test User" });
    account.createJWT
      .mockResolvedValueOnce({ jwt: "initial-jwt" })
      .mockRejectedValueOnce(new Error("JWT refresh failed"));

    // Use fake timers
    vi.useFakeTimers();

    // Render the hook
    renderHook(() => useAutoRefreshJWT());

    // Wait for the initial effect to run
    await vi.runAllTimersAsync();

    // Verify initial JWT was set
    expect(account.createJWT).toHaveBeenCalledTimes(1);
    expect(localStorage.setItem).toHaveBeenCalledWith("jwt", "initial-jwt");

    // Fast forward to trigger interval refresh
    vi.advanceTimersByTime(15 * 60 * 1000);

    // Should have attempted to refresh JWT
    expect(account.createJWT).toHaveBeenCalledTimes(2);

    // Should have warned about refresh failure
    expect(console.warn).toHaveBeenCalled();

    // Restore real timers
    vi.useRealTimers();
  });
});
