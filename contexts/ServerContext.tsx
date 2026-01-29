import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { apiClient, HeartbeatResponse } from '../services/api';

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

// Helper function to compare semantic versions
const compareVersions = (version1: string, version2: string): number => {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
        const v1 = v1Parts[i] || 0;
        const v2 = v2Parts[i] || 0;
        
        if (v1 > v2) return 1;
        if (v1 < v2) return -1;
    }
    
    return 0;
};

export const ServerProvider: React.FC<ServerProviderProps> = ({ children }) => {
    const [serverVersion, setServerVersion] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const refreshServerInfo = async () => {
        try {
            setIsLoading(true);
            const heartbeat = await apiClient.getHeartbeat();
            const version = heartbeat.SYSTEM.VERSION;
            setServerVersion(version);
            apiClient.setServerVersion(version);
            console.log('Server version:', version);
        } catch (error) {
            console.error('Failed to fetch server info:', error);
            // Don't set error state - we'll try again later
            setServerVersion(null);
        } finally {
            setIsLoading(false);
        }
    };

    const isServerVersionAtLeast = (minVersion: string): boolean => {
        if (!serverVersion) return false;
        return compareVersions(serverVersion, minVersion) >= 0;
    };

    // Initialize server info on app start
    useEffect(() => {
        refreshServerInfo();
    }, []);

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
