"use client";

import { useState, useEffect } from 'react';

export default function DebugRenderCount() {
  const [renderCount, setRenderCount] = useState(0);
  const [visiblePosition, setVisiblePosition] = useState({ top: '10px', left: '10px' });

  useEffect(() => {
    // 增加渲染计数
    setRenderCount(prev => prev + 1);

    // 记录组件的挂载位置
    const element = document.querySelector('[data-render-debug]');
    if (element) {
      const rect = element.getBoundingClientRect();
      setVisiblePosition({
        top: `${rect.top + window.scrollY}px`,
        left: `${rect.left + window.scrollX}px`,
      });
    }
  }, []);

  return (
    <div 
      data-render-debug
      style={{
        position: 'absolute',
        top: visiblePosition.top,
        left: visiblePosition.left,
        background: 'rgba(255, 0, 0, 0.8)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 9999,
      }}
    >
      Render #: {renderCount}
    </div>
  );
} 