import { expect, test, describe, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button Component", () => {
  test("renders button with children", () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeDefined();
  });

  test("applies variants correctly", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);

    let button = screen.getByRole("button", { name: /default/i });
    // Default variant should have certain classes (this depends on your implementation)
    expect(button.className).toContain("bg-primary");

    // Rerender with different variant
    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole("button", { name: /outline/i });
    expect(button.className).toContain("border");

    // Rerender with destructive variant
    rerender(<Button variant="destructive">Destructive</Button>);
    button = screen.getByRole("button", { name: /destructive/i });
    expect(button.className).toContain("bg-destructive");
  });

  test("applies size correctly", () => {
    const { rerender } = render(<Button size="default">Default Size</Button>);

    let button = screen.getByRole("button", { name: /default size/i });
    // Default size should have certain classes

    // Rerender with small size
    rerender(<Button size="sm">Small</Button>);
    button = screen.getByRole("button", { name: /small/i });
    expect(button.className).toContain("h-9");

    // Rerender with large size
    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole("button", { name: /large/i });
    expect(button.className).toContain("h-11");
  });

  test("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);

    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
  });

  test("handles click events", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test("does not trigger click when disabled", () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click me
      </Button>
    );

    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  test("renders as a different element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    );

    const link = screen.getByRole("link", { name: /link button/i });
    expect(link.tagName).toBe("A");
    expect(link.getAttribute("href")).toBe("/test");
    // Should still have button styling
    expect(link.className).toContain("inline-flex");
  });
});
