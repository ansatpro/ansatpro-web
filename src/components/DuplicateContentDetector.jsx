"use client";

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 组件用于检测和解决页面内容重复渲染问题
 * 在可能有问题的页面顶部引入此组件
 */
export default function DuplicateContentDetector() {
  const pathname = usePathname();
  const mountTimeRef = useRef(Date.now());
  const pageIdRef = useRef(`page-${Math.random().toString(36).slice(2, 7)}`);
  
  useEffect(() => {
    console.log(`[DuplicateDetector] 页面 ${pathname} 已挂载，ID: ${pageIdRef.current}`);
    
    // 检查是否存在重复页面
    const checkDuplicateContent = () => {
      // 设置页面标识符
      if (typeof document !== 'undefined') {
        document.body.setAttribute('data-current-page', pathname);
        document.body.setAttribute('data-page-instance', pageIdRef.current);
        
        // 检查页面内容容器
        const contentContainers = document.querySelectorAll('main');
        if (contentContainers.length > 1) {
          console.warn(`[DuplicateDetector] 发现多个主内容区域 (${contentContainers.length})`);
          
          // 为每个内容区域添加标识
          contentContainers.forEach((container, index) => {
            container.setAttribute('data-content-index', index);
            if (index > 0) {
              console.log(`[DuplicateDetector] 移除重复内容区域 #${index}`);
              container.style.display = 'none'; // 隐藏而非删除，便于调试
            }
          });
        }
        
        // 检查是否整个页面结构被重复
        const pageStructures = Array.from(document.querySelectorAll('[data-layout-id]'));
        const uniqueLayoutIds = new Set(pageStructures.map(el => el.getAttribute('data-layout-id')));
        
        if (pageStructures.length > uniqueLayoutIds.size) {
          console.warn(`[DuplicateDetector] 检测到布局重复挂载: ${pageStructures.length} 实例，${uniqueLayoutIds.size} 个唯一ID`);
          
          // 仅保留每个唯一ID的第一个实例
          const seen = new Set();
          pageStructures.forEach((structure) => {
            const id = structure.getAttribute('data-layout-id');
            if (seen.has(id)) {
              console.log(`[DuplicateDetector] 移除重复布局: ${id}`);
              structure.style.display = 'none'; // 隐藏而非删除，便于调试
            } else {
              seen.add(id);
            }
          });
        }
      }
    };
    
    // 允许DOM完全加载
    const initialCheck = setTimeout(checkDuplicateContent, 500);
    
    // 监听滚动事件，在用户滚动时再次检查
    // 这可以捕获由于懒加载或条件渲染导致的重复内容
    const handleScroll = () => {
      if (Date.now() - mountTimeRef.current > 2000) {
        // 只在页面加载2秒后启用滚动检查，避免初始渲染时误报
        checkDuplicateContent();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      clearTimeout(initialCheck);
      window.removeEventListener('scroll', handleScroll);
      console.log(`[DuplicateDetector] 页面 ${pathname} 已卸载，ID: ${pageIdRef.current}`);
    };
  }, [pathname]);
  
  // 此组件不渲染任何内容
  return null;
} 