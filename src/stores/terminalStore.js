import { create } from 'zustand';

export const useTerminalStore = create((set, get) => ({
  // Terminal state
  input: '',
  commandHistory: [],
  historyIndex: -1,
  currentPath: '~',
  
  // SSH state
  sshConnections: [],
  activeConnection: null,
  
  // Actions
  setInput: (input) => set({ input }),
  
  addToCommandHistory: (command) => {
    const { commandHistory } = get();
    // Don't add duplicate consecutive commands
    if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== command) {
      set({ 
        commandHistory: [...commandHistory, command],
        historyIndex: commandHistory.length + 1
      });
    }
  },
  
  navigateHistory: (direction) => {
    const { commandHistory, historyIndex } = get();
    if (commandHistory.length === 0) return;
    
    let newIndex;
    if (direction === 'up') {
      newIndex = Math.max(0, historyIndex - 1);
    } else {
      newIndex = Math.min(commandHistory.length, historyIndex + 1);
    }
    
    if (newIndex === commandHistory.length) {
      set({ historyIndex: newIndex, input: '' });
    } else {
      set({ historyIndex: newIndex, input: commandHistory[newIndex] });
    }
  },
  
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
  }
}));