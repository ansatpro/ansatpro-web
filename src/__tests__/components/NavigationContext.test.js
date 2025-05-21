import { expect, test, describe } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavigationProvider, useNavigation } from "@/context/NavigationContext";
import { useState } from "react";

// Mock usePathname hook
vi.mock("next/navigation", () => ({
  usePathname: vi.fn(() => "/test-path"),
}));

// Test component that uses NavigationContext
function TestComponent() {
  const { activeLink, isLinkActive } = useNavigation();
  const [testLinks] = useState(["/test-path", "/other-path", "/test-path/sub"]);

  return (
    <div>
      <div data-testid="active-link">{activeLink}</div>
      <ul>
        {testLinks.map((link) => (
          <li key={link} data-testid={`link-${link}`}>
            <span>{link}</span>
            <span data-testid={`active-${link}`}>
              {isLinkActive(link).toString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

describe("NavigationContext", () => {
  test("should set active link based on pathname", () => {
    // Mock usePathname to return '/test-path'

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // The active link should be the first segment of the pathname
    expect(screen.getByTestId("active-link").textContent).toBe("/test-path");
  });

  test("isLinkActive should correctly identify active links", () => {
    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // '/test-path' should be active
    expect(screen.getByTestId("active-/test-path").textContent).toBe("true");

    // Other paths should not be active
    expect(screen.getByTestId("active-/other-path").textContent).toBe("false");

    // Sub-paths of the active path should not be active by default
    expect(screen.getByTestId("active-/test-path/sub").textContent).toBe(
      "false"
    );
  });

  test("throws error when useNavigation is used outside provider", () => {
    // Mock console.error to prevent error output in tests
    const originalConsoleError = console.error;
    console.error = vi.fn();

    // Expect the render to throw
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useNavigation must be used within a NavigationProvider");

    // Restore console.error
    console.error = originalConsoleError;
  });

  test("should handle root path correctly", () => {
    // Mock usePathname to return root path
    vi.mocked(require("next/navigation").usePathname).mockReturnValue("/");

    render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // The active link should be "/"
    expect(screen.getByTestId("active-link").textContent).toBe("/");
  });

  test("should update active link when pathname changes", async () => {
    const { rerender } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // Initially '/test-path' should be active
    expect(screen.getByTestId("active-link").textContent).toBe("/test-path");

    // Change the path
    vi.mocked(require("next/navigation").usePathname).mockReturnValue(
      "/other-path"
    );

    // Rerender to trigger the effect
    rerender(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // The active link should now be '/other-path'
    expect(screen.getByTestId("active-link").textContent).toBe("/other-path");
  });
});
