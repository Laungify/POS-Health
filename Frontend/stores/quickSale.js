import { create } from 'zustand';

const useQuickSaleState = create((set) => ({
  quickSale: null,
  setQuickSale: (quickSale) => {
    set(() => ({ quickSale }));
  },
  clearQuickSale: () => {
    set(() => ({ quickSale: {} }));
  },
}));

export default useQuickSaleState;
