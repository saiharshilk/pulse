import { create } from 'zustand';

import { successHaptic, warningHaptic } from '@/utils/haptics';

export type ToastKind = 'success' | 'warning' | 'info';
export type Toast = { id: number; message: string; kind: ToastKind };

type ToastState = {
  toast: Toast | null;
  showToast: (message: string, kind?: ToastKind) => void;
  hideToast: (id: number) => void;
};

let nextId = 1;

// One toast at a time; a new one replaces the old. ToastHost shows it and hides it after 2 s.
export const useToastStore = create<ToastState>()((set, get) => ({
  toast: null,
  showToast: (message, kind = 'info') => {
    if (kind === 'success') successHaptic();
    if (kind === 'warning') warningHaptic();
    set({ toast: { id: nextId++, message, kind } });
  },
  hideToast: (id) => {
    if (get().toast?.id === id) set({ toast: null });
  },
}));

// For code outside React components, e.g. store actions.
export function showToast(message: string, kind?: ToastKind): void {
  useToastStore.getState().showToast(message, kind);
}
