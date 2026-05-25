import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import '../components/common/AppModal.css';

type AlertOptions = {
  title?: string;
};

type ConfirmOptions = {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ModalState =
  | {
      type: 'alert';
      message: string;
      title: string;
      resolve: () => void;
    }
  | {
      type: 'confirm';
      message: string;
      title: string;
      confirmText: string;
      cancelText: string;
      danger: boolean;
      resolve: (value: boolean) => void;
    };

type AppModalContextValue = {
  showAlert: (message: string, options?: AlertOptions) => Promise<void>;
  showConfirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
};

const AppModalContext = createContext<AppModalContextValue | null>(null);

export const AppModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modal, setModal] = useState<ModalState | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const showAlert = useCallback((message: string, options?: AlertOptions) => {
    return new Promise<void>((resolve) => {
      setModal({
        type: 'alert',
        message,
        title: options?.title ?? 'Уведомление',
        resolve,
      });
    });
  }, []);

  const showConfirm = useCallback((message: string, options?: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setModal({
        type: 'confirm',
        message,
        title: options?.title ?? 'Подтверждение',
        confirmText: options?.confirmText ?? 'Подтвердить',
        cancelText: options?.cancelText ?? 'Отмена',
        danger: options?.danger ?? false,
        resolve,
      });
    });
  }, []);

  const closeAlert = () => {
    if (modal?.type === 'alert') {
      modal.resolve();
      setModal(null);
    }
  };

  const closeConfirm = (value: boolean) => {
    if (modal?.type === 'confirm') {
      modal.resolve(value);
      setModal(null);
    }
  };

  useEffect(() => {
    if (modal?.type !== 'confirm') return;
    confirmBtnRef.current?.focus();
  }, [modal]);

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modal.type === 'alert') closeAlert();
        else closeConfirm(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal]);

  return (
    <AppModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modal && (
        <div
          className="app-modal-overlay"
          role="presentation"
          onClick={() =>
            modal.type === 'alert' ? closeAlert() : closeConfirm(false)
          }
        >
          <div
            className="app-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="app-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="app-modal-title" className="app-modal-title">
              {modal.title}
            </h2>
            <p className="app-modal-message">{modal.message}</p>
            <div className="app-modal-actions">
              {modal.type === 'confirm' && (
                <button
                  type="button"
                  className="app-modal-btn app-modal-btn--secondary"
                  onClick={() => closeConfirm(false)}
                >
                  {modal.cancelText}
                </button>
              )}
              <button
                ref={modal.type === 'confirm' ? confirmBtnRef : undefined}
                type="button"
                className={`app-modal-btn ${
                  modal.type === 'confirm' && modal.danger
                    ? 'app-modal-btn--danger'
                    : 'app-modal-btn--primary'
                }`}
                onClick={() =>
                  modal.type === 'alert' ? closeAlert() : closeConfirm(true)
                }
              >
                {modal.type === 'alert' ? 'ОК' : modal.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppModalContext.Provider>
  );
};

export function useAppModal(): AppModalContextValue {
  const ctx = useContext(AppModalContext);
  if (!ctx) {
    throw new Error('useAppModal must be used within AppModalProvider');
  }
  return ctx;
}
