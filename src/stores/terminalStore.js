import { create } from 'zustand';

export const useTerminalStore = create((set, get) => ({
  // Terminal settings
  settings: {
    theme: 'spaceship', // 'spaceship', 'classic', 'minimal'
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: 14,
    lineHeight: 1.3,
    cursorBlink: true,
    cursorStyle: 'block', // 'block', 'underline', 'bar'
    promptSections: {
      userHost: true,
      directory: true,
      git: true,
      execTime: true,
      exitCode: true,
      node: true,
      docker: false,
      python: false,
      golang: false,
      ruby: false
    },
    scrollback: 5000,
    tabWidth: 4,
  },
  
  // Terminal session state
  tabs: [],
  activeTabId: null,
  commandHistory: [],
  historyIndex: -1,
  currentPath: '~',
  activeCommand: '',
  commandResult: null,
  commandStartTime: null,
  commandEndTime: null,
  lastCommandDuration: null,
  lastCommandStatus: 0,
  
  // SSH state
  sshConnections: [],
  activeConnection: null,
  
  // Terminal settings actions
  updateSettings: (newSettings) => set({
    settings: {
      ...get().settings,
      ...newSettings
    }
  }),
  
  // Toggle prompt section
  togglePromptSection: (sectionName, value) => set({
    settings: {
      ...get().settings,
      promptSections: {
        ...get().settings.promptSections,
        [sectionName]: value !== undefined ? value : !get().settings.promptSections[sectionName]
      }
    }
  }),
  
  // Terminal tab actions
  addTab: (tab) => {
    const { tabs } = get();
    set({ 
      tabs: [...tabs, tab],
      activeTabId: tab.id
    });
  },
  
  removeTab: (tabId) => {
    const { tabs, activeTabId } = get();
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    
    set({ 
      tabs: newTabs,
      activeTabId: activeTabId === tabId ? 
        (newTabs.length > 0 ? newTabs[newTabs.length - 1].id : null) : 
        activeTabId
    });
  },
  
  setActiveTab: (tabId) => set({ activeTabId: tabId }),
  
  // Command and history actions
  setActiveCommand: (command) => set({ activeCommand: command }),
  
  setCommandResult: (result) => set({ commandResult: result }),
  
  setCommandStartTime: (time) => set({ commandStartTime: time }),
  
  setCommandEndTime: (time) => {
    const { commandStartTime } = get();
    const duration = commandStartTime ? (time - commandStartTime) / 1000 : null;
    
    set({ 
      commandEndTime: time,
      lastCommandDuration: duration
    });
  },
  
  setLastCommandStatus: (status) => set({ lastCommandStatus: status }),
  
  addToCommandHistory: (command) => {
    const { commandHistory } = get();
    // Don't add duplicate consecutive commands
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
      set({ 
        commandHistory: [...commandHistory, command],
        historyIndex: -1
      });
    }
  },
  
  setHistoryIndex: (index) => set({ historyIndex: index }),
  
  navigateHistory: (direction) => {
    const { commandHistory, historyIndex } = get();
    if (commandHistory.length === 0) return;
    
    let newIndex;
    if (direction === 'up') {
      newIndex = historyIndex === -1 ? 
        commandHistory.length - 1 : 
        Math.max(0, historyIndex - 1);
    } else {
      newIndex = Math.min(commandHistory.length, historyIndex + 1);
    }
    
    set({ historyIndex: newIndex });
    
    if (newIndex === commandHistory.length) {
      return '';
    } else {
      return commandHistory[newIndex];
    }
  },
  
  clearHistory: () => set({ commandHistory: [], historyIndex: -1 }),
  
  setCurrentPath: (path) => set({ currentPath: path }),
  
  // SSH actions
  addSSHConnection: (connection) => {
    const { sshConnections } = get();
    set({ 
      sshConnections: [...sshConnections, connection],
      activeConnection: connection
    });
  },
  
  removeSSHConnection: (id) => {
    const { sshConnections, activeConnection } = get();
    const newConnections = sshConnections.filter(conn => conn.id !== id);
    
    set({ 
      sshConnections: newConnections,
      activeConnection: activeConnection?.id === id ? null : activeConnection
    });
  },
  
  setActiveConnection: (id) => {
    const { sshConnections } = get();
    const connection = sshConnections.find(conn => conn.id === id);
    set({ activeConnection: connection || null });
  },
  
  // Git state and actions
  gitInfo: {},
  
  setGitInfo: (path, info) => set({
    gitInfo: {
      ...get().gitInfo,
      [path]: info
    }
  }),
  
  // Environment info (node, python, etc.)
  environmentInfo: {},
  
  setEnvironmentInfo: (key, value) => set({
    environmentInfo: {
      ...get().environmentInfo,
      [key]: value
    }
  })
}));