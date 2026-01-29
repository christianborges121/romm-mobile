import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { apiClient, HeartbeatResponse } from '../services/api';
import { compareVersions } from '../services/versionUtils';

interface ServerContextType {
    serverVersion: string | null;
    isLoading: boolean;
    isServerVersionAtLeast: (minVersion: string) => boolean;
    refreshServerInfo: () => Promise<void>;
}

const ServerContext = createContext<ServerContextType | undefined>(undefined);

export const useServer = () => {
    const context = useContext(ServerContext);
    if (context === undefined) {
        throw new Error('useServer must be used within a ServerProvider');
    }
    return context;
};

interface ServerProviderProps {
    children: ReactNode;
}

export const ServerProvider: React.FC<ServerProviderProps> = ({ children }) => {
    const [serverVersion, setServerVersion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshServerInfo = useCallback(async () => {
        try {
            setIsLoading(true);
            const heartbeat = await apiClient.getHeartbeat();
            const version = heartbeat.SYSTEM.VERSION;
            setServerVersion(version);
            apiClient.setServerVersion(version);
            console.debug('Server version:', version);
        } catch (error) {
            console.error('Failed to fetch server info:', error);
            // Don't set error state - we'll try again later
            setServerVersion(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const isServerVersionAtLeast = useCallback((minVersion: string): boolean => {
        if (!serverVersion) return false;
        return compareVersions(serverVersion, minVersion) >= 0;
    }, [serverVersion]);

    // Initialize server info on app start
    useEffect(() => {
        refreshServerInfo();
    }, [refreshServerInfo]);

    const value: ServerContextType = {
        serverVersion,
        isLoading,
        isServerVersionAtLeast,
        refreshServerInfo,
    };

    return (
        <ServerContext.Provider value={value}>
            {children}
        </ServerContext.Provider>
    );
};
