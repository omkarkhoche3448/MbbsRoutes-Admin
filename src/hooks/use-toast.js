import { useState } from 'react';

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = ({ title, description, duration = 3000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts([...toasts, { id, title, description, duration }]);
    setTimeout(() => {
      setToasts((currentToasts) => currentToasts.filter((t) => t.id !== id));
    }, duration);
  };

  return { toast, toasts };
};