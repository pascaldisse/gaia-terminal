import React from 'react';
import styled from 'styled-components';

const ToolbarContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #282a36;
  border-top-left-radius: 6px;
  border-top-right-radius: 6px;
  padding: 8px 12px;
  font-family: 'JetBrains Mono', monospace;
`;

const TitleSection = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 8px;
    color: #50fa7b;
  }
  
  h2 {
    color: #f8f8f2;
    font-size: 14px;
    margin: 0;
  }
`;

const ControlsSection = styled.div`
  display: flex;
  gap: 12px;
`;

const ToolbarButton = styled.button`
  background-color: transparent;
  border: none;
  color: #f8f8f2;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 12px;
  transition: color 0.2s;
  
  svg {
    margin-right: 4px;
  }
  
  &:hover {
    color: #8be9fd;
  }
  
  &.new-tab:hover {
    color: #50fa7b;
  }
  
  &.ssh:hover {
    color: #ff79c6;
  }
`;

const TerminalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 17L10 11L4 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SSHIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M21 15V21H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 21H3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M3 9V3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SettingsIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15C19.1277 15.8031 19.2583 16.6915 19.75 17.38C20.0232 17.7718 20.1619 18.2249 20.1456 18.6859C20.1293 19.1468 19.9589 19.5899 19.6602 19.9602C19.3615 20.3305 18.9499 20.6078 18.4944 20.7534C18.0389 20.8991 17.5526 20.9058 17.093 20.772L16.996 20.738C16.5311 20.5983 16.0343 20.6068 15.5757 20.7616C15.1171 20.9164 14.7274 21.208 14.468 21.591C14.2353 21.9214 13.9211 22.1912 13.5576 22.3771C13.1941 22.5629 12.7923 22.6597 12.385 22.6597C11.9777 22.6597 11.5759 22.5629 11.2124 22.3771C10.8489 22.1912 10.5347 21.9214 10.302 21.591C10.0389 21.2106 9.64548 20.9225 9.18326 20.7713C8.72104 20.6201 8.22078 20.6157 7.756 20.76L7.657 20.794C7.19745 20.9278 6.71112 20.9211 6.25562 20.7754C5.80012 20.6297 5.38847 20.3525 5.08976 19.9822C4.79106 19.6118 4.62069 19.1688 4.60442 18.7078C4.58815 18.2468 4.7268 17.7938 5 17.402C5.49167 16.7135 5.62226 15.8251 5.34997 15.022C5.11285 14.2391 4.57349 13.5897 3.86 13.229C3.46881 13.0443 3.14062 12.7668 2.90635 12.4254C2.67208 12.084 2.53954 11.6894 2.52438 11.2834C2.50922 10.8775 2.61207 10.4741 2.82153 10.1161C3.03099 9.75804 3.33857 9.45781 3.71 9.246C4.44653 8.88927 4.99778 8.21995 5.22 7.416C5.44175 6.63432 5.31835 5.80311 4.86 5.194C4.58672 4.80223 4.44801 4.34917 4.46428 3.88817C4.48055 3.42716 4.65093 2.98412 4.93964 2.61379C5.22834 2.24346 5.64 1.96618 6.0955 1.82055C6.55099 1.67492 7.03733 1.6816 7.497 1.816L7.594 1.85C8.0589 1.98967 8.55575 1.98122 9.01435 1.82641C9.47295 1.67159 9.86259 1.38002 10.122 1C10.3547 0.669626 10.6689 0.399751 11.0324 0.213906C11.3959 0.0280615 11.7977 -0.0687714 12.205 -0.0687714C12.6123 -0.0687714 13.0141 0.0280615 13.3776 0.213906C13.7411 0.399751 14.0553 0.669626 14.288 1C14.5514 1.3804 14.9448 1.66848 15.407 1.81967C15.8692 1.97086 16.3695 1.97526 16.834 1.831L16.933 1.797C17.3926 1.6633 17.8789 1.65997 18.3344 1.80564C18.7899 1.95131 19.2016 2.22863 19.5002 2.59898C19.7989 2.96934 19.9693 3.4124 19.9856 3.87342C20.0019 4.33444 19.8632 4.78752 19.59 5.179C19.0983 5.8675 18.9677 6.7559 19.24 7.559C19.4764 8.34043 20.0153 8.98893 20.728 9.35C21.1197 9.53449 21.4485 9.81206 21.6832 10.1538C21.9179 10.4955 22.0506 10.8907 22.0656 11.2972C22.0806 11.7037 21.9774 12.1075 21.7674 12.4658C21.5574 12.8241 21.2492 13.1243 20.877 13.336C20.1473 13.6945 19.6014 14.3609 19.38 15.16L19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TerminalToolbar = ({ onNewTab, onOpenSSH, onOpenSettings }) => {
  return (
    <ToolbarContainer>
      <TitleSection>
        <TerminalIcon />
        <h2>Gaia Terminal</h2>
      </TitleSection>
      
      <ControlsSection>
        <ToolbarButton className="new-tab" onClick={onNewTab}>
          <PlusIcon />
          New Tab
        </ToolbarButton>
        
        <ToolbarButton className="ssh" onClick={onOpenSSH}>
          <SSHIcon />
          SSH
        </ToolbarButton>
        
        <ToolbarButton onClick={onOpenSettings}>
          <SettingsIcon />
          Settings
        </ToolbarButton>
      </ControlsSection>
    </ToolbarContainer>
  );
};

export default TerminalToolbar;