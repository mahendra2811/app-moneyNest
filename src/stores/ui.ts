import { create } from 'zustand';

export type ToastTone = 'success' | 'error' | 'info';

export type ToastMessage = {
  id: string;
  tone: ToastTone;
  text: string;
  actionLabel?: string;
  onAction?: () => void;
};

type UiState = {
  toast: ToastMessage | null;
  showToast: (t: Omit<ToastMessage, 'id'>) => void;
  dismissToast: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  toast: null,
  showToast: (t) =>
    set({
      toast: { ...t, id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
    }),
  dismissToast: () => set({ toast: null }),
}));
