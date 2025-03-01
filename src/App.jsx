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
`

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  flex: 1;
  height: calc(100% - 40px);
  position: relative;
  overflow: hidden;
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