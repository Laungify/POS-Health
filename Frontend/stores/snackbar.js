import { create } from 'zustand';

const useSnackbarState = create((set) => ({
  status: false,
  message: '',
  variant: '',
  open: (variant, message) => {
    set(() => ({ status: true }));
    set(() => ({ variant }));
    set(() => ({ message }));
  },
  close: () => {
    set(() => ({ status: false }));
    set(() => ({ variant: '' }));
    set(() => ({ message: '' }));
  },
}));

export default useSnackbarState;
