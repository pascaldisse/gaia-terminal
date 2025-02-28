import React from 'react';
import styled from 'styled-components';

const TabsContainer = styled.div`
  display: flex;
  background-color: #191a21;
  padding: 0 12px;
  overflow-x: auto;
  
  &::-webkit-scrollbar {
    height: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background-color: #191a21;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: #44475a;
    border-radius: 4px;
  }
`;

const Tab = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  min-width: 120px;
  max-width: 180px;
  cursor: pointer;
  border-top: 2px solid ${props => props.active ? '#bd93f9' : 'transparent'};
  background-color: ${props => props.active ? '#282a36' : 'transparent'};
  transition: background-color 0.2s;
  
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
  
  &:hover {
    background-color: #44475a;
    color: #ff5555;
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

const TerminalTabs = ({ tabs, activeTab, onTabClick, onTabClose }) => {
  return (
    <TabsContainer>
      {tabs.map((tab) => (
        <Tab 
          key={tab.id} 
          active={tab.id === activeTab}
          onClick={() => onTabClick(tab.id)}
        >
          <TabIcon type={tab.type}>
            {tab.type === 'ssh' ? '⚡' : '❯'}
          </TabIcon>
          <TabTitle active={tab.id === activeTab}>
            {tab.title}
            {tab.type === 'ssh' && <span className="hostname">@{tab.hostname}</span>}
          </TabTitle>
          <CloseButton onClick={(e) => {
            e.stopPropagation();
            onTabClose(tab.id);
          }}>
            ×
          </CloseButton>
        </Tab>
      ))}
    </TabsContainer>
  );
};

export default TerminalTabs;