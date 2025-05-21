import { expect, test, describe } from "vitest";
import { cn } from "../lib/utils";

describe("cn utility function", () => {
  test("should combine class names correctly", () => {
    // Test with simple strings
    expect(cn("class1", "class2")).toBe("class1 class2");

    // Test with conditionals
    expect(cn("class1", true && "class2", false && "class3")).toBe(
      "class1 class2"
    );

    // Test with undefined/null values
    expect(cn("class1", undefined, null, "class2")).toBe("class1 class2");

    // Test with empty strings
    expect(cn("class1", "", "class2")).toBe("class1 class2");

    // Test with number values
    expect(cn("class1", 2, "class3")).toBe("class1 2 class3");

    // Test with object notation (from tailwind-merge functionality)
    expect(
      cn("font-bold", "text-sm md:text-base", {
        "bg-blue-500": true,
        "text-white": true,
        "rounded-none": false,
      })
    ).toContain("font-bold");
    expect(
      cn("font-bold", "text-sm md:text-base", {
        "bg-blue-500": true,
        "text-white": true,
        "rounded-none": false,
      })
    ).toContain("bg-blue-500");
    expect(
      cn("font-bold", "text-sm md:text-base", {
        "bg-blue-500": true,
        "text-white": true,
        "rounded-none": false,
      })
    ).toContain("text-white");
    expect(
      cn("font-bold", "text-sm md:text-base", {
        "bg-blue-500": true,
        "text-white": true,
        "rounded-none": false,
      })
    ).not.toContain("rounded-none");
  });

  test("should handle conflicting tailwind classes", () => {
    // Testing tailwind-merge functionality for handling conflicts
    // For example, it should keep the last padding class and discard earlier ones
    const result = cn("p-2", "p-4", "p-8");

    // Should only contain the last padding value
    expect(result).toBe("p-8");
    expect(result).not.toContain("p-2");
    expect(result).not.toContain("p-4");

    // Test with responsive variants
    const responsiveResult = cn("p-2", "md:p-4", "lg:p-6");
    expect(responsiveResult).toContain("p-2");
    expect(responsiveResult).toContain("md:p-4");
    expect(responsiveResult).toContain("lg:p-6");

    // Complex example mixing regular classes with conditionals and responsive variants
    const complexResult = cn(
      "text-sm",
      "md:text-base",
      true && "font-bold",
      false && "italic",
      { "text-red-500": true, "text-sm": false }
    );

    // Should contain the correct classes
    expect(complexResult).toContain("md:text-base");
    expect(complexResult).toContain("font-bold");
    expect(complexResult).toContain("text-red-500");

    // Should not contain overridden or false classes
    expect(complexResult).not.toContain("italic");

    // The text-sm class is in a conflict with text-sm in the object,
    // but the object has it as false so tailwind-merge would remove it
    // or it would be overridden by another size class
    // This is a complex case that depends on the exact implementation
  });
});
