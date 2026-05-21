import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import '../components/common/dashboard-mobile-nav.css';

type SidebarDrawerContextValue = {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const SidebarDrawerContext = createContext<SidebarDrawerContextValue | null>(null);

export const SidebarDrawerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  useEffect(() => {
    close();
  }, [location.pathname, close]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.classList.add('dashboard-sidebar-open');
    return () => {
      document.body.classList.remove('dashboard-sidebar-open');
    };
  }, [isOpen]);

  const value = useMemo(
    () => ({ isOpen, open, close, toggle }),
    [isOpen, open, close, toggle]
  );

  return (
    <SidebarDrawerContext.Provider value={value}>
      {children}
      {isOpen && (
        <button
          type="button"
          className="dashboard-sidebar-backdrop"
          aria-label="Закрыть меню"
          onClick={close}
        />
      )}
    </SidebarDrawerContext.Provider>
  );
};

export function useSidebarDrawer(): SidebarDrawerContextValue {
  const ctx = useContext(SidebarDrawerContext);
  if (!ctx) {
    throw new Error('useSidebarDrawer must be used within SidebarDrawerProvider');
  }
  return ctx;
}
