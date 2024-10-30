import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCurrentShopState = create(
  persist(
    (set) => ({
      currentShop: {},
      setCurrentShop: (currentShop) => {
        set(() => ({ currentShop }));
      },
    }),
    {
      name: 'currentShop',
    }
  )
);

export default useCurrentShopState;
