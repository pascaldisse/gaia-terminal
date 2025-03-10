import { create } from 'zustand'
import { nanoid } from 'nanoid/non-secure'
import { persist } from 'zustand/middleware'

// Load saved connections from localStorage
const loadSavedConnections = () => {
  try {
    const savedConnections = localStorage.getItem('gaia-terminal-connections')
    return savedConnections ? JSON.parse(savedConnections) : {}
  } catch (error) {
    console.error('Failed to load saved connections:', error)
    return {}
  }
}

export const useTerminalStore = create(
  persist(
    (set, get) => ({
  // Terminal tabs
  tabs: [],
  activeTab: null,
  
  // Terminal settings
  fontSize: 14,
  fontFamily: 'JetBrains Mono, monospace',
  theme: {
    background: '#1a1a1a',
    foreground: '#e0e0e0',
    cursor: '#6c71c4',
    selection: 'rgba(108, 113, 196, 0.3)',
    black: '#073642',
    red: '#dc322f',
    green: '#859900',
    yellow: '#b58900',
    blue: '#268bd2',
    magenta: '#d33682',
    cyan: '#2aa198',
    white: '#eee8d5',
    brightBlack: '#002b36',
    brightRed: '#cb4b16',
    brightGreen: '#586e75',
    brightYellow: '#657b83',
    brightBlue: '#839496',
    brightMagenta: '#6c71c4',
    brightCyan: '#93a1a1',
    brightWhite: '#fdf6e3'
  },
  
  // Command history
  commandHistory: {},
  historyIndex: {},
  
  // SSH connections
  sshConnections: {},
  activeConnections: {},
  
  // Environment info
  environment: {
    username: 'user',
    hostname: 'localhost',
    path: '~',
    nodeVersion: process.env.NODE_VERSION || 'v18.x',
    gitBranch: '',
    gitStatus: ''
  },
  
  // Actions
  addTab: (name = 'Terminal') => {
    const id = nanoid()
    set(state => {
      const newTabs = [...state.tabs, { id, name }]
      return { 
        tabs: newTabs, 
        activeTab: id,
        commandHistory: { ...state.commandHistory, [id]: [] },
        historyIndex: { ...state.historyIndex, [id]: -1 }
      }
    })
    return id
  },
  
  closeTab: (id) => {
    set(state => {
      const tabIndex = state.tabs.findIndex(tab => tab.id === id)
      const newTabs = state.tabs.filter(tab => tab.id !== id)
      
      // Clean up history for the closed tab
      const { [id]: _, ...newHistory } = state.commandHistory
      const { [id]: __, ...newHistoryIndex } = state.historyIndex
      
      // Determine new active tab
      let newActiveTab = state.activeTab
      if (id === state.activeTab) {
        if (newTabs.length > 0) {
          const newIndex = Math.min(tabIndex, newTabs.length - 1)
          newActiveTab = newTabs[newIndex].id
        } else {
          newActiveTab = null
        }
      }
      
      return { 
        tabs: newTabs, 
        activeTab: newActiveTab,
        commandHistory: newHistory,
        historyIndex: newHistoryIndex
      }
    })
  },
  
  setActiveTab: (id) => {
    set({ activeTab: id })
  },
  
  addCommand: (tabId, command) => {
    set(state => {
      const history = state.commandHistory[tabId] || []
      // Don't add duplicate consecutive commands
      if (history.length === 0 || history[history.length - 1] !== command) {
        return {
          commandHistory: {
            ...state.commandHistory,
            [tabId]: [...history, command]
          },
          historyIndex: {
            ...state.historyIndex,
            [tabId]: history.length + 1
          }
        }
      }
      return {
        historyIndex: {
          ...state.historyIndex,
          [tabId]: history.length
        }
      }
    })
  },
  
  getPreviousCommand: (tabId) => {
    const state = get()
    const history = state.commandHistory[tabId] || []
    const index = state.historyIndex[tabId] || 0
    
    if (history.length === 0 || index <= 0) {
      return ''
    }
    
    const newIndex = index - 1
    set({
      historyIndex: {
        ...state.historyIndex,
        [tabId]: newIndex
      }
    })
    
    return history[newIndex]
  },
  
  getNextCommand: (tabId) => {
    const state = get()
    const history = state.commandHistory[tabId] || []
    const index = state.historyIndex[tabId] || 0
    
    if (history.length === 0 || index >= history.length) {
      return ''
    }
    
    const newIndex = index + 1
    set({
      historyIndex: {
        ...state.historyIndex,
        [tabId]: newIndex
      }
    })
    
    return newIndex === history.length ? '' : history[newIndex]
  },
  
  resetHistoryIndex: (tabId) => {
    set(state => ({
      historyIndex: {
        ...state.historyIndex,
        [tabId]: state.commandHistory[tabId]?.length || 0
      }
    }))
  },
  
  // Settings
  updateSettings: (settings) => {
    set(state => ({ ...state, ...settings }))
  },
  
  // Environment
  updateEnvironment: (env) => {
    set(state => ({
      environment: {
        ...state.environment,
        ...env
      }
    }))
  },
  
  // SSH connections
  addSSHConnection: (connection) => {
    const id = nanoid()
    set(state => ({
      sshConnections: {
        ...state.sshConnections,
        [id]: { ...connection, id }
      }
    }))
    return id
  },
  
  removeSSHConnection: (id) => {
    set(state => {
      const { [id]: _, ...connections } = state.sshConnections
      return { sshConnections: connections }
    })
  },
  
  setActiveConnection: (tabId, connectionId) => {
    set(state => ({
      activeConnections: {
        ...state.activeConnections,
        [tabId]: connectionId
      }
    }))
  },
  
  clearActiveConnection: (tabId) => {
    set(state => {
      const { [tabId]: _, ...activeConns } = state.activeConnections
      return { activeConnections: activeConns }
    })
  },
  
  // Initialize with saved connections
  initSavedConnections: () => {
    const savedConnections = loadSavedConnections()
    if (Object.keys(savedConnections).length > 0) {
      set({ sshConnections: savedConnections })
    }
  },
  
  // Get saved named connections only
  getSavedNamedConnections: () => {
    return Object.values(get().sshConnections).filter(conn => conn.name && conn.name.trim() !== '')
  },
  
  // Inject text into the terminal
  injectTextAction: null,
  
  // Set the inject text action (registered by the Terminal component)
  setInjectTextAction: (action) => {
    set({ injectTextAction: action })
  },
  
  // Call the inject text action
  injectText: (text) => {
    const action = get().injectTextAction
    if (action) {
      action(text)
      return true
    }
    return false
  }
}), 
{
  name: 'gaia-terminal-store',
  partialize: (state) => ({
    sshConnections: Object.fromEntries(
      Object.entries(state.sshConnections).filter(([_, conn]) => conn.name && conn.name.trim() !== '')
    ),
    fontSize: state.fontSize,
    fontFamily: state.fontFamily,
    theme: state.theme
  })
}))