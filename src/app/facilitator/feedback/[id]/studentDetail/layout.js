"use client";

import DuplicateContentDetector from "@/components/DuplicateContentDetector";

export default function StudentDetailLayout({ children }) {
  return (
    <>
      <DuplicateContentDetector />
      {children}
    </>
  );
} 