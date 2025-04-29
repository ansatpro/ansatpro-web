/**
 * @fileoverview Toast Notification Component
 * @description A toast notification component using Sonner library with theme support.
 */

"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";

/**
 * @function Toaster
 * @description Toast notification component with theme support
 * @param {Object} props - Component props
 * @returns {JSX.Element} Toast notification component
 */
const Toaster = ({
  ...props
}) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)"
        }
      }
      {...props} />
  );
}

export { Toaster }
