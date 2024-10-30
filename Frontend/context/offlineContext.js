import React, { createContext, useContext } from 'react';
import useOnlineStatus from '../hooks/useOnlineStatsHook';

const OfflineContext = createContext();

export default function OfflineProvider({ children }) {
    const isOnline = useOnlineStatus();

    return (
        <OfflineContext.Provider value={isOnline}>
            {children}
        </OfflineContext.Provider>
    );
};

export const useOffline = () => useContext(OfflineContext);
