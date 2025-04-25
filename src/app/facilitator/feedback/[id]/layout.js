"use client";

import DuplicateContentDetector from "@/components/DuplicateContentDetector";
import { useEffect } from "react";

export default function FeedbackDetailLayout({ children }) {
  // Check for and clean up any duplicate layout elements
  useEffect(() => {
    // Add a small delay to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      const mainElements = document.querySelectorAll("main");
      if (mainElements.length > 1) {
        console.warn(`Found ${mainElements.length} main elements - potential layout duplication`);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <DuplicateContentDetector />
      {children}
    </>
  );
} 