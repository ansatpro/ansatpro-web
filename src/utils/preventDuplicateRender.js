"use client";

import { useEffect, useRef } from 'react';

/**
 * 防止组件内容重复渲染的自定义Hook
 * @param {string} componentName - 组件名称（用于日志记录）
 * @returns {{isFirstRender: boolean, renderCount: React.MutableRefObject<number>}}
 */
export function usePreventDuplicateRender(componentName = 'Component') {
  const renderCount = useRef(0);
  const componentKey = useRef(`${componentName}-${Math.random().toString(36).slice(2, 7)}`);
  const isFirstRender = useRef(true);

  useEffect(() => {
    renderCount.current += 1;
    
    if (renderCount.current > 1) {
      console.warn(`${componentName} 已重复渲染 ${renderCount.current} 次，key=${componentKey.current}`);
    }
    
    // 检查是否有其他相同类型的组件已经渲染
    if (typeof window !== 'undefined') {
      const existingKeys = window.__COMPONENT_RENDER_KEYS || {};
      
      if (existingKeys[componentName] && existingKeys[componentName] !== componentKey.current) {
        console.warn(`检测到 ${componentName} 的多个实例，可能导致内容重复`);
      }
      
      // 记录此组件已经渲染
      window.__COMPONENT_RENDER_KEYS = {
        ...existingKeys,
        [componentName]: componentKey.current
      };
    }
    
    isFirstRender.current = false;
    
    return () => {
      // 组件卸载时清理
      if (typeof window !== 'undefined' && window.__COMPONENT_RENDER_KEYS) {
        if (window.__COMPONENT_RENDER_KEYS[componentName] === componentKey.current) {
          delete window.__COMPONENT_RENDER_KEYS[componentName];
        }
      }
    };
  }, [componentName]);

  return { 
    isFirstRender: isFirstRender.current,
    renderCount
  };
}

/**
 * 防止页面内容重复挂载的函数
 * 可以在页面组件中调用
 */
export function cleanupDuplicateContents() {
  if (typeof window !== 'undefined') {
    // 等待DOM加载完成
    setTimeout(() => {
      // 查找所有内容容器（主要内容区域）
      const mainElements = document.querySelectorAll('main');
      
      if (mainElements.length > 1) {
        console.warn(`检测到多个 main 元素: ${mainElements.length}`);
        
        // 保留第一个main元素，移除其他
        for (let i = 1; i < mainElements.length; i++) {
          console.log(`移除重复的 main 元素 #${i}`);
          mainElements[i].remove();
        }
      }
      
      // 检查其他可能重复的元素，如card、section等
      const cardContainers = document.querySelectorAll('.card');
      const seenCardIds = new Set();
      
      cardContainers.forEach(card => {
        const cardId = card.dataset.cardId || card.id || card.textContent?.trim().substring(0, 20);
        
        if (seenCardIds.has(cardId)) {
          console.log(`移除重复的卡片: ${cardId}`);
          card.remove();
        } else {
          seenCardIds.add(cardId);
        }
      });
    }, 500);
  }
} 