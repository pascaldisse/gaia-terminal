import React from 'react';
import styled from 'styled-components';
import { useTerminalStore } from '../../stores/terminalStore';

const TabsContainer = styled.div`
  display: flex;
  background-color: #191a21;
  padding: 0 6px;
  overflow-x: auto;
  scrollbar-width: thin;
  scrollbar-color: #44475a #191a21;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: #191a21;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #44475a;
    border-radius: 4px;
    
    &:hover {
      background-color: #6272a4;
    }
  }
`;

const Tab = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  min-width: 120px;
  max-width: 200px;
  cursor: pointer;
  border-top: 2px solid ${props => props.active ? '#bd93f9' : 'transparent'};
  background-color: ${props => props.active ? '#282a36' : 'transparent'};
  transition: all 0.2s;
  margin-right: 2px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
  
  &:hover {
    background-color: ${props => props.active ? '#282a36' : '#21222c'};
  }
`;

const TabTitle = styled.div`
  color: ${props => props.active ? '#f8f8f2' : '#6272a4'};
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-right: 8px;
  
  .hostname {
    margin-left: 4px;
    font-weight: normal;
    opacity: 0.7;
  }
`;

const CloseButton = styled.button`
  background-color: transparent;
  border: none;
  color: #6272a4;
  width: 16px;
  height: 16px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  border-radius: 50%;
  opacity: 0.7;
  transition: all 0.2s;
  
  &:hover {
    background-color: #44475a;
    color: #ff5555;
    opacity: 1;
  }
`;

const TabIcon = styled.span`
  margin-right: 8px;
  color: ${props => {
    if (props.type === 'ssh') return '#ff79c6';
    if (props.type === 'local') return '#50fa7b';
    return '#bd93f9';
  }};
`;

const AddTabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;
  border: none;
  color: #6272a4;
  width: 28px;
  height: 28px;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  border-radius: 4px;
  transition: all 0.2s;
  
  &:hover {
    background-color: #21222c;
    color: #50fa7b;
  }
`;

// Generate an icon based on tab type
const getTabIcon = (tab) => {
  switch(tab.type) {
    case 'ssh':
      return '⚡'; // SSH
    case 'python':
      return '🐍'; // Python
    case 'node':
      return '⬢'; // Node.js
    case 'docker':
      return '🐳'; // Docker
    case 'local':
    default:
      return '❯'; // Local terminal
  }
};

const TerminalTabs = ({ onNewTab }) => {
  const { tabs, activeTabId, setActiveTab, removeTab } = useTerminalStore();
  
  // Handle tab click
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };
  
  // Handle tab close
  const handleTabClose = (tabId, e) => {
    e.stopPropagation();
    removeTab(tabId);
  };
  
  return (
    <TabsContainer>
      {tabs.map((tab) => (
        <Tab 
          key={tab.id} 
          active={tab.id === activeTabId}
          onClick={() => handleTabClick(tab.id)}
        >
          <TabIcon type={tab.type}>
            {getTabIcon(tab)}
          </TabIcon>
          <TabTitle active={tab.id === activeTabId}>
            {tab.title}
            {tab.type === 'ssh' && tab.hostname && <span className="hostname">@{tab.hostname}</span>}
          </TabTitle>
          <CloseButton onClick={(e) => handleTabClose(tab.id, e)}>
            ×
          </CloseButton>
        </Tab>
      ))}
      
      <AddTabButton onClick={onNewTab} title="New Terminal">
        +
      </AddTabButton>
    </TabsContainer>
  );
};

export default TerminalTabs;