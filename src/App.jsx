import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Terminal from './components/Terminal/Terminal';
import TerminalToolbar from './components/Terminal/TerminalToolbar';
import TerminalTabs from './components/Terminal/TerminalTabs';
import SSHModal from './components/SSH/SSHModal';
import SettingsPanel from './components/Settings/SettingsPanel';
import { useTerminalStore } from './stores/terminalStore';
import './App.css';

// Import custom font
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    background-color: #191a21;
    font-family: 'JetBrains Mono', monospace;
    color: #f8f8f2;
    height: 100vh;
    overflow: hidden;
  }
  
  #root {
    height: 100vh;
    display: flex;
    flex-direction: column;
  }
  
  :root {
    color-scheme: dark;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #191a21;
`;

const TerminalContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  margin: 0 8px 8px 8px;
  border-radius: 0 0 8px 8px;
`;

const EmptyStateMessage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #6272a4;
  
  .icon {
    font-size: 48px;
    margin-bottom: 16px;
    color: #44475a;
  }
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    color: #bd93f9;
  }
  
  p {
    max-width: 450px;
    text-align: center;
    margin: 0 0 24px 0;
    line-height: 1.5;
  }
  
  button {
    background-color: #bd93f9;
    color: #282a36;
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      background-color: #a57aed;
    }
  }
`;

function App() {
  const [isSSHModalOpen, setIsSSHModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const { 
    tabs, 
    activeTabId, 
    addTab, 
    setActiveTab 
  } = useTerminalStore();
  
  // Create an initial terminal tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      createNewTab();
    }
  }, [tabs.length]);
  
  const createNewTab = () => {
    const newTabId = Date.now().toString();
    const newTab = {
      id: newTabId,
      title: 'Terminal',
      type: 'local',
    };
    
    addTab(newTab);
  };
  
  const handleOpenSSH = () => {
    setIsSSHModalOpen(true);
  };
  
  const handleCloseSSH = () => {
    setIsSSHModalOpen(false);
  };
  
  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <TerminalToolbar 
          onNewTab={createNewTab}
          onOpenSSH={handleOpenSSH}
          onOpenSettings={handleOpenSettings}
        />
        
        <TerminalTabs 
          onNewTab={createNewTab}
        />
        
        <TerminalContainer>
          {tabs.length === 0 ? (
            <EmptyStateMessage>
              <div className="icon">🚀</div>
              <h3>Welcome to Spaceflight Terminal</h3>
              <p>
                A modern, spaceship-prompt inspired terminal with SSH capabilities.
                Get started by opening a new terminal session.
              </p>
              <button onClick={createNewTab}>New Terminal</button>
            </EmptyStateMessage>
          ) : (
            tabs.map(tab => (
              <div key={tab.id} style={{ 
                display: activeTabId === tab.id ? 'flex' : 'none',
                height: '100%',
                flex: 1
              }}>
                <Terminal id={tab.id} />
              </div>
            ))
          )}
        </TerminalContainer>
        
        <SSHModal 
          isOpen={isSSHModalOpen}
          onClose={handleCloseSSH}
        />
        
        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </AppContainer>
    </>
  );
}

export default App;