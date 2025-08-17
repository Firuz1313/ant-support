// Temporary stub for DataContext to fix imports
// TODO: Remove this file and update all components to use API hooks

import React, { createContext, useContext } from 'react';

interface DataContextType {
  // Devices
  devices: any[];
  getActiveDevices: () => any[];
  getDeviceById: (id: string) => any;
  createDevice: (data: any) => Promise<any>;
  updateDevice: (id: string, data: any) => Promise<any>;
  deleteDevice: (id: string) => Promise<void>;

  // Problems
  problems: any[];
  getProblemsForDevice: (deviceId: string) => any[];
  createProblem: (data: any) => Promise<any>;
  updateProblem: (id: string, data: any) => Promise<any>;
  deleteProblem: (id: string) => Promise<void>;

  // Steps
  steps: any[];
  getStepsForProblem: (problemId: string) => any[];
  createStep: (data: any) => Promise<any>;
  updateStep: (id: string, data: any) => Promise<any>;
  deleteStep: (id: string) => Promise<void>;
  reorderSteps: (problemId: string, stepIds: string[]) => Promise<void>;

  // Remotes
  remotes: any[];
  getRemoteById: (id: string) => any;
  getDefaultRemote: () => any;
  getDefaultRemoteForDevice: (deviceId: string) => any;
  getRemotesForDevice: (deviceId: string) => any[];
  getActiveRemotes: () => any[];
  canDeleteRemote: (id: string) => { canDelete: boolean; reason?: string };
  getRemoteUsageCount: (id: string) => number;
  createRemote: (data: any) => Promise<any>;
  updateRemote: (id: string, data: any) => Promise<any>;
  deleteRemote: (id: string) => Promise<void>;

  // Sessions
  sessions: any[];
  getActiveSessions: () => any[];
  createSession: (data: any) => Promise<any>;
  updateSession: (id: string, data: any) => Promise<any>;

  // Change logs
  changeLogs: any[];

  // Stats
  getEntityStats: (entity: string) => { total: number; active: number; inactive: number };

  // Data operations
  refreshData: () => Promise<void>;
  exportData: (options: any) => Promise<any>;

  // Settings
  siteSettings: any;
  updateSiteSettings: (settings: any) => Promise<any>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Stub provider that returns empty/default values
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value: DataContextType = {
    devices: [],
    getActiveDevices: () => [],
    getDeviceById: () => null,
    createDevice: async () => ({}),
    updateDevice: async () => ({}),
    deleteDevice: async () => {},

    problems: [],
    getProblemsForDevice: () => [],
    createProblem: async () => ({}),
    updateProblem: async () => ({}),
    deleteProblem: async () => {},

    steps: [],
    getStepsForProblem: () => [],
    createStep: async () => ({}),
    updateStep: async () => ({}),
    deleteStep: async () => {},
    reorderSteps: async () => {},

    remotes: [],
    getRemoteById: () => null,
    getDefaultRemote: () => null,
    getDefaultRemoteForDevice: () => null,
    getRemotesForDevice: () => [],
    getActiveRemotes: () => [],
    canDeleteRemote: () => ({ canDelete: true }),
    getRemoteUsageCount: () => 0,
    createRemote: async () => ({}),
    updateRemote: async () => ({}),
    deleteRemote: async () => {},

    sessions: [],
    getActiveSessions: () => [],
    createSession: async () => ({}),
    updateSession: async () => ({}),

    changeLogs: [],

    getEntityStats: () => ({ total: 0, active: 0, inactive: 0 }),

    refreshData: async () => {},
    exportData: async () => ({ downloadUrl: '' }),

    siteSettings: {
      siteName: 'ANT Support',
      siteDescription: 'TV Diagnostics Platform',
      theme: 'professional'
    },
    updateSiteSettings: async () => ({}),
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
