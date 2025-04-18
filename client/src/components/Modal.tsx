import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnBackdropClick?: boolean;
  children: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  closeOnBackdropClick = true,
  children,
}: ModalProps) {
  useEffect(() => {
    function handleEscapeKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && closeOnBackdropClick) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
  }, [isOpen, onClose, closeOnBackdropClick]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={closeOnBackdropClick ? onClose : undefined}
      role="button"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full 
                   mx-4 shadow-xl"
        onClick={e => e.stopPropagation()}
        role="button"
      >
        {children}
      </div>
    </div>
  );
}
