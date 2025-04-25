"use client";

import FacilitatorLayout from "@/layouts/FacilitatorLayout";
import { useEffect } from "react";

export default function FacilitatorRootLayout({ children }) {
  // 检查重复挂载的布局组件
  useEffect(() => {
    // 等待DOM完全加载
    const checkForDuplicateLayouts = () => {
      const layoutElements = document.querySelectorAll('[data-layout-id]');
      
      if (layoutElements.length > 1) {
        console.warn(`检测到多个布局挂载: ${layoutElements.length} 个布局实例`);
        
        // 保留第一个布局，移除其他布局
        for (let i = 1; i < layoutElements.length; i++) {
          console.log(`移除重复的布局实例 #${i}`);
          layoutElements[i].remove();
        }
      }
    };

    const timer = setTimeout(checkForDuplicateLayouts, 500);
    return () => clearTimeout(timer);
  }, []);
  
  return <FacilitatorLayout>{children}</FacilitatorLayout>;
} 