import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import '../components/common/AppModal.css';

type MessageModalOptions = {
  title?: string;
  confirmText?: string;
};

type ConfirmOptions = {
  title?: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ModalState =
  | {
      type: 'message';
      message: string;
      title: string;
      confirmText: string;
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
  showModal: (message: string, options?: MessageModalOptions) => Promise<void>;
  showConfirm: (message: string, options?: ConfirmOptions) => Promise<boolean>;
};

const AppModalContext = createContext<AppModalContextValue | null>(null);

export const AppModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [modal, setModal] = useState<ModalState | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  const showModal = useCallback((message: string, options?: MessageModalOptions) => {
    return new Promise<void>((resolve) => {
      setModal({
        type: 'message',
        message,
        title: options?.title ?? 'Сообщение',
        confirmText: options?.confirmText ?? 'Понятно',
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

  const closeMessage = () => {
    if (modal?.type === 'message') {
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
        if (modal.type === 'message') closeMessage();
        else closeConfirm(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modal]);

  return (
    <AppModalContext.Provider value={{ showModal, showConfirm }}>
      {children}
      {modal && (
        <div
          className="app-modal-overlay"
          role="presentation"
          onClick={() =>
            modal.type === 'message' ? closeMessage() : closeConfirm(false)
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
                  modal.type === 'message'
                    ? closeMessage()
                    : closeConfirm(true)
                }
              >
                {modal.type === 'message' ? modal.confirmText : modal.confirmText}
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
