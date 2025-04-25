"use client";

import DuplicateContentDetector from "@/components/DuplicateContentDetector";

export default function FeedbackDetailLayout({ children }) {
  return (
    <>
      <DuplicateContentDetector />
      {children}
    </>
  );
} 