import { useEffect } from 'react';

export const useNavigationBlocker = (block: boolean, message?: string) => {
  useEffect(() => {
    if (!block) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message || 'Are you sure you want to leave?';
      return message || 'Are you sure you want to leave?';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [block, message]);
};
