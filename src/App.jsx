import { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Terminal from './components/Terminal/Terminal';
import TerminalToolbar from './components/Terminal/TerminalToolbar';
import TerminalTabs from './components/Terminal/TerminalTabs';
import SSHModal from './components/SSH/SSHModal';
import './App.css';

// Import custom font
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&display=swap');
  
  body {
    margin: 0;
    padding: 0;
    background-color: #282a36;
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
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #282a36;
`;

const TerminalContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

function App() {
  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [isSSHModalOpen, setIsSSHModalOpen] = useState(false);
  
  // Create an initial terminal tab on mount
  useEffect(() => {
    if (tabs.length === 0) {
      const initialTab = {
        id: '1',
        title: 'Terminal',
        type: 'local',
      };
      
      setTabs([initialTab]);
      setActiveTab('1');
    }
  }, [tabs]);
  
  const handleNewTab = () => {
    const newTabId = Date.now().toString();
    const newTab = {
      id: newTabId,
      title: 'Terminal',
      type: 'local',
    };
    
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
  };
  
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };
  
  const handleTabClose = (tabId) => {
    const filteredTabs = tabs.filter(tab => tab.id !== tabId);
    
    if (filteredTabs.length === 0) {
      // Create a new tab if all tabs are closed
      handleNewTab();
    } else if (activeTab === tabId) {
      // If we're closing the active tab, switch to the last tab
      setActiveTab(filteredTabs[filteredTabs.length - 1].id);
    }
    
    setTabs(filteredTabs);
  };
  
  const handleOpenSSH = () => {
    setIsSSHModalOpen(true);
  };
  
  const handleCloseSSH = () => {
    setIsSSHModalOpen(false);
  };
  
  const handleOpenSettings = () => {
    // We'll implement settings later
    console.log('Settings clicked');
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <TerminalToolbar 
          onNewTab={handleNewTab}
          onOpenSSH={handleOpenSSH}
          onOpenSettings={handleOpenSettings}
        />
        
        <TerminalTabs 
          tabs={tabs}
          activeTab={activeTab}
          onTabClick={handleTabClick}
          onTabClose={handleTabClose}
        />
        
        <TerminalContainer>
          {tabs.map(tab => (
            <div key={tab.id} style={{ 
              display: activeTab === tab.id ? 'flex' : 'none',
              height: '100%' 
            }}>
              <Terminal />
            </div>
          ))}
        </TerminalContainer>
        
        <SSHModal 
          isOpen={isSSHModalOpen}
          onClose={handleCloseSSH}
        />
      </AppContainer>
    </>
  );
}

export default App;
