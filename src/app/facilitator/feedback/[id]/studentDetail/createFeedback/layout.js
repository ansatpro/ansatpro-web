"use client";

import DuplicateContentDetector from "@/components/DuplicateContentDetector";

export default function CreateFeedbackLayout({ children }) {
  return (
    <>
      <DuplicateContentDetector />
      {children}
    </>
  );
} 