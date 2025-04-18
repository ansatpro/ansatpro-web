"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Navigation Context for managing the active navigation state across the application
 * @type {React.Context<{activeLink: string, isLinkActive: (href: string) => boolean}>}
 */
const NavigationContext = createContext();

/**
 * Provider component for Navigation Context
 * Manages active link state and provides the isLinkActive function
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components that will have access to the navigation context
 * @returns {React.ReactElement} NavigationContext Provider wrapped around children
 */
export function NavigationProvider({ children }) {
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState("/");

  useEffect(() => {
    // Determine which navigation item should be highlighted based on current path
    if (pathname === "/") {
      setActiveLink("/");
    } else {
      // Find the best matching path prefix
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length > 0) {
        const firstSegment = `/${segments[0]}`;
        setActiveLink(firstSegment);
      }
    }
  }, [pathname]);

  /**
   * Determines if a link should be highlighted as active
   * Special handling for root path "/"
   *
   * @param {string} href - The href value of the link to check
   * @returns {boolean} True if the link should be considered active
   */
  const isLinkActive = (href) => {
    if (href === "/") {
      return activeLink === "/";
    }
    return activeLink === href;
  };

  return (
    <NavigationContext.Provider value={{ activeLink, isLinkActive }}>
      {children}
    </NavigationContext.Provider>
  );
}

/**
 * Custom hook for accessing the navigation context
 * Must be used within a NavigationProvider
 *
 * @returns {{ activeLink: string, isLinkActive: (href: string) => boolean }} Navigation context values
 * @throws {Error} When used outside of a NavigationProvider
 */
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
