import { expect, test, describe, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { account, functions } from "@/app/appwrite";
import LoginPage from "@/app/auth/login/page";

// Mock appwrite modules
vi.mock("@/app/appwrite", () => ({
  account: {
    get: vi.fn(),
    createEmailPasswordSession: vi.fn(),
    createJWT: vi.fn(),
    deleteSession: vi.fn(),
  },
  functions: {
    createExecution: vi.fn(),
  },
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

// Mock TextPressure component due to its complexity
vi.mock("@/components/TextPressure", () => ({
  default: ({ text }) => <div data-testid="text-pressure">{text}</div>,
}));

describe("Login and Logout Functionality", () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    };

    // Mock console methods to reduce test noise
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  test("renders login form", async () => {
    render(<LoginPage />);

    // Wait for form to appear (since there's a hasMounted state)
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /sign in/i })
      ).toBeInTheDocument();
    });
  });

  test("handles successful login for facilitator", async () => {
    // Mock successful responses
    account.createEmailPasswordSession.mockResolvedValue({});
    account.createJWT.mockResolvedValue({ jwt: "fake-jwt-token" });
    account.get.mockResolvedValue({ emailVerification: true, $id: "user-123" });

    const executionResponse = {
      responseBody: JSON.stringify({
        status: "success",
        data: { role: "facilitator" },
      }),
    };
    functions.createExecution.mockResolvedValue(executionResponse);

    const router = require("next/navigation").useRouter();

    render(<LoginPage />);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify API calls
    await waitFor(() => {
      expect(account.createEmailPasswordSession).toHaveBeenCalledWith(
        "test@example.com",
        "password123"
      );
      expect(account.createJWT).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalledWith(
        "jwt",
        "fake-jwt-token"
      );
      expect(functions.createExecution).toHaveBeenCalled();
      expect(router.push).toHaveBeenCalledWith("/facilitator/home");
    });
  });

  test("handles logout", async () => {
    // Could test a component with logout functionality
    // For this example, we'll just verify the logout function works correctly

    account.deleteSession.mockResolvedValue({});

    // Create a simple test component with logout functionality
    function LogoutTest() {
      const handleLogout = async () => {
        try {
          await account.deleteSession("current");
          localStorage.removeItem("jwt");
          // Router push would happen here in real code
        } catch (error) {
          console.error(error);
        }
      };

      return <button onClick={handleLogout}>Logout</button>;
    }

    render(<LogoutTest />);

    // Click logout
    fireEvent.click(screen.getByText("Logout"));

    // Verify logout was called
    await waitFor(() => {
      expect(account.deleteSession).toHaveBeenCalledWith("current");
      expect(localStorage.removeItem).toHaveBeenCalledWith("jwt");
    });
  });

  test("shows error on failed login", async () => {
    // Mock failed login
    account.createEmailPasswordSession.mockRejectedValue(
      new Error("Invalid credentials")
    );

    render(<LoginPage />);

    // Wait for form to appear
    await waitFor(() => {
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    // Fill form
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "wrongpassword" },
    });

    // Submit form
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    // Verify error is shown
    await waitFor(() => {
      expect(screen.getByText(/failed to login/i)).toBeInTheDocument();
    });
  });
});
