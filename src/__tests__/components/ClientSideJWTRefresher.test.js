import { expect, test, describe, vi } from "vitest";
import { render } from "@testing-library/react";
import ClientSideJWTRefresher from "@/components/ClientSideJWTRefresher";
import { useAutoRefreshJWT } from "@/hooks/useAutoRefreshJWT";

// Mock the useAutoRefreshJWT hook
vi.mock("@/hooks/useAutoRefreshJWT", () => ({
  useAutoRefreshJWT: vi.fn(),
}));

describe("ClientSideJWTRefresher Component", () => {
  test("calls useAutoRefreshJWT hook", () => {
    render(<ClientSideJWTRefresher />);

    // Verify the hook was called
    expect(useAutoRefreshJWT).toHaveBeenCalledTimes(1);
  });

  test("renders nothing visible", () => {
    const { container } = render(<ClientSideJWTRefresher />);

    // Should not have any visual elements
    expect(container.firstChild).toBeNull();
  });
});
