"use client";

import { useEffect, useCallback } from "react";

export default function DuplicateContentDetector() {
  const checkForDuplicates = useCallback(() => {
    // Detect multiple main content areas on the page
    const mainElements = document.querySelectorAll("main");
    if (mainElements.length > 1) {
      console.warn(`Detected multiple main content areas (${mainElements.length})! This may cause duplicate rendering.`);
      console.log("Duplicate elements:", mainElements);
    }

    // Detect duplicate layout instances
    const layoutElements = document.querySelectorAll("[data-layout-id]");
    const layoutIds = new Map();
    
    layoutElements.forEach(el => {
      const id = el.getAttribute("data-layout-id");
      if (layoutIds.has(id)) {
        layoutIds.set(id, layoutIds.get(id) + 1);
      } else {
        layoutIds.set(id, 1);
      }
    });
    
    layoutIds.forEach((count, id) => {
      if (count > 1) {
        console.warn(`Layout ID '${id}' appears ${count} times! This indicates the layout is being rendered multiple times.`);
      }
    });
    
    // Find potentially duplicate content wrappers
    const contentWrappers = document.querySelectorAll(".bg-white.min-h-screen");
    if (contentWrappers.length > 1) {
      console.warn(`Detected multiple content wrappers (${contentWrappers.length})! Page may have duplicate rendering.`);
    }

    // Try to find duplicate sibling content
    const allElements = document.querySelectorAll("*");
    const duplicateSiblings = new Map();
    
    allElements.forEach(el => {
      if (el.parentNode) {
        const siblings = Array.from(el.parentNode.children);
        const similarSiblings = siblings.filter(sib => 
          sib !== el && 
          sib.tagName === el.tagName && 
          sib.className === el.className &&
          sib.innerHTML === el.innerHTML
        );
        
        if (similarSiblings.length > 0) {
          const key = `${el.tagName}-${el.className}`;
          duplicateSiblings.set(key, (duplicateSiblings.get(key) || 0) + 1);
        }
      }
    });
    
    duplicateSiblings.forEach((count, key) => {
      if (count > 5) { // Set threshold to ignore common duplicates (like list items)
        console.warn(`Detected potentially duplicate content: ${key}, appears ${count} times`);
      }
    });
  }, []);

  useEffect(() => {
    // Check on page load
    checkForDuplicates();
    
    // Check on DOM changes
    const observer = new MutationObserver(() => {
      setTimeout(checkForDuplicates, 500); // Delay check to allow for all DOM updates
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => observer.disconnect();
  }, [checkForDuplicates]);

  return null; // This component doesn't render anything
} 