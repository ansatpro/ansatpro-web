import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  NotificationsProvider,
  useNotifications,
} from "../context/NotificationsContext";
import { act } from "react-dom/test-utils";

// Test component that uses the NotificationsContext
function TestComponent() {
  const {
    hasNotifications,
    setHasNotifications,
    finalNotification,
    setFinalNotification,
  } = useNotifications();

  return (
    <div>
      <div data-testid="has-notifications">{hasNotifications.toString()}</div>
      <button
        data-testid="toggle-notifications"
        onClick={() => setHasNotifications(!hasNotifications)}
      >
        Toggle
      </button>

      <div data-testid="notification-count">{finalNotification.length}</div>
      <button
        data-testid="add-notification"
        onClick={() =>
          setFinalNotification([
            ...finalNotification,
            { id: Date.now(), message: "Test notification" },
          ])
        }
      >
        Add
      </button>
    </div>
  );
}

// Wrapper component for testing
function TestWrapper({ children }) {
  return <NotificationsProvider>{children}</NotificationsProvider>;
}

describe("NotificationsContext", () => {
  test("provides default values", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Default value should be false
    expect(screen.getByTestId("has-notifications").textContent).toBe("false");
    expect(screen.getByTestId("notification-count").textContent).toBe("0");
  });

  test("toggles hasNotifications state", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Initial state
    expect(screen.getByTestId("has-notifications").textContent).toBe("false");

    // Toggle state
    act(() => {
      screen.getByTestId("toggle-notifications").click();
    });

    // State should be updated
    expect(screen.getByTestId("has-notifications").textContent).toBe("true");
  });

  test("adds notifications to finalNotification state", () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Initial state
    expect(screen.getByTestId("notification-count").textContent).toBe("0");

    // Add notification
    act(() => {
      screen.getByTestId("add-notification").click();
    });

    // State should be updated
    expect(screen.getByTestId("notification-count").textContent).toBe("1");

    // Add another notification
    act(() => {
      screen.getByTestId("add-notification").click();
    });

    // State should be updated
    expect(screen.getByTestId("notification-count").textContent).toBe("2");
  });

  test("throws error when used outside provider", () => {
    // Mock console.error to prevent error output in tests
    const originalConsoleError = console.error;
    console.error = jest.fn();

    // Expect the render to throw
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useNotifications must be used within a NotificationsProvider");

    // Restore console.error
    console.error = originalConsoleError;
  });
});
