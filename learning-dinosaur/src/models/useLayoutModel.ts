import { useState } from 'react';

export default function useLayoutModel() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 992;
    }
    return true;
  });

  const toggleSidebar = () => {
    setCollapsed(prev => !prev);
  };

  return {
    collapsed,
    setCollapsed,
    toggleSidebar,
  };
}
