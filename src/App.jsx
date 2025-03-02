import { useState, useEffect } from 'react'
import styled from 'styled-components'
import './App.css'
import Terminal from './components/Terminal/Terminal'
import TerminalTabs from './components/Terminal/TerminalTabs'
import TerminalToolbar from './components/Terminal/TerminalToolbar'
import SettingsPanel from './components/Settings/SettingsPanel'
import SSHModal from './components/SSH/SSHModal'
import { useTerminalStore } from './stores/terminalStore'

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100% - 40px);
  position: relative;
  overflow: hidden;
  
  @media (max-width: 600px) {
    /* Ensure the terminal has room on small screens */
    height: calc(100% - 80px); /* Account for toolbar and tabs */
    flex: 1;
    min-height: 0;
    position: absolute;
    top: 80px;
    left: 0;
    right: 0;
    bottom: 0;
  }
`

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [showSSHModal, setShowSSHModal] = useState(false)
  const { activeTab, tabs, addTab, initSavedConnections } = useTerminalStore()
  
  // Initialize application state
  useEffect(() => {
    // Initialize any saved SSH connections
    initSavedConnections()
    
    // If no tabs exist, create a default one
    if (tabs.length === 0) {
      addTab('Local Terminal')
    }
  }, [tabs, addTab, initSavedConnections])

  return (
    <AppContainer>
      <TerminalToolbar 
        onSettingsClick={() => setShowSettings(!showSettings)}
        onSSHClick={() => setShowSSHModal(true)}
      />
      <MainContent>
        <TerminalTabs />
        {tabs.map(tab => (
          <Terminal 
            key={tab.id} 
            id={tab.id} 
            visible={tab.id === activeTab} 
          />
        ))}
        
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
        
        {showSSHModal && (
          <SSHModal onClose={() => setShowSSHModal(false)} />
        )}
      </MainContent>
    </AppContainer>
  )
}

export default App