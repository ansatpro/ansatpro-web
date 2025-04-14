"use client"

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

// Create Navigation Context
const NavigationContext = createContext();

// Navigation Provider Component
export function NavigationProvider({ children }) {
  const pathname = usePathname();
  const [activeLink, setActiveLink] = useState("/");

  // Update activeLink when path changes
  useEffect(() => {
    // Determine which navigation item should be highlighted based on current path
    if (pathname === "/") {
      setActiveLink("/");
    } else {
      // Find the best matching path prefix
      const segments = pathname.split('/').filter(Boolean);
      if (segments.length > 0) {
        const firstSegment = `/${segments[0]}`;
        setActiveLink(firstSegment);
      }
    }
  }, [pathname]);

  // Function to determine if link should be highlighted
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

// Custom hook for components to use this context
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}