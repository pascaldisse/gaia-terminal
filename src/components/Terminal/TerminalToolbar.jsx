import { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'
import { useTerminalStore } from '../../stores/terminalStore'

const ToolbarContainer = styled.div`
  display: flex;
  height: 40px;
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--bg-tertiary);
  align-items: center;
  padding: 0 8px;
  justify-content: space-between;
`

const ToolbarTitle = styled.div`
  font-weight: bold;
  color: var(--text-primary);
  margin-left: 8px;
`

const ToolbarActions = styled.div`
  display: flex;
  gap: 8px;
`

const ToolbarButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  padding: 0 12px;
  border: none;
  border-radius: 4px;
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background-color: var(--accent-primary);
    color: white;
  }
  
  svg {
    margin-right: ${props => props.text ? '6px' : '0'};
  }
  
  &.active {
    background-color: var(--accent-primary);
    color: white;
  }
`

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.hasMargin ? '6px' : '0'};
`

const QuickConnectMenu = styled.div`
  position: absolute;
  top: 44px;
  right: 120px;
  width: 300px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--bg-tertiary);
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow: hidden;
  max-height: 400px;
  overflow-y: auto;
`

const QuickConnectHeader = styled.div`
  padding: 10px 16px;
  font-weight: 500;
  border-bottom: 1px solid var(--bg-tertiary);
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const EmptyConnections = styled.div`
  padding: 16px;
  text-align: center;
  color: var(--text-secondary);
`

const ConnectionList = styled.div`
  max-height: 350px;
  overflow-y: auto;
`

const ConnectionItem = styled.div`
  padding: 10px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--bg-tertiary);
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: var(--bg-tertiary);
  }
`

const ConnectionInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const ConnectionName = styled.div`
  font-weight: 500;
  color: var(--text-primary);
`

const ConnectionDetails = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
`

function TerminalToolbar({ onSettingsClick, onSSHClick }) {
  const [showQuickConnect, setShowQuickConnect] = useState(false)
  const quickConnectButtonRef = useRef(null)
  const quickConnectMenuRef = useRef(null)
  const { 
    getSavedNamedConnections, 
    addTab, 
    setActiveConnection 
  } = useTerminalStore()
  
  const [savedConnections, setSavedConnections] = useState([])
  
  // Load saved connections
  useEffect(() => {
    setSavedConnections(getSavedNamedConnections())
  }, [getSavedNamedConnections])
  
  // Handle clicks outside of the quick connect menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showQuickConnect && 
        quickConnectMenuRef.current && 
        quickConnectButtonRef.current && 
        !quickConnectMenuRef.current.contains(event.target) &&
        !quickConnectButtonRef.current.contains(event.target)
      ) {
        setShowQuickConnect(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showQuickConnect])
  
  const toggleQuickConnect = () => {
    // Only toggle if there are saved connections
    if (savedConnections.length > 0) {
      setShowQuickConnect(!showQuickConnect)
    } else {
      // If no saved connections, open the full SSH modal
      onSSHClick()
    }
  }
  
  const connectToSaved = (connection) => {
    // Create a new tab for this connection
    const tabName = `SSH: ${connection.username}@${connection.host}`
    const newTabId = addTab(tabName)
    
    // Set as active connection for the new tab
    setActiveConnection(newTabId, connection.id)
    
    // Close the menu
    setShowQuickConnect(false)
  }
  
  const hasConnections = savedConnections.length > 0
  
  return (
    <ToolbarContainer>
      <ToolbarTitle>Gaia Terminal</ToolbarTitle>
      
      <ToolbarActions>
        {/* Quick Connect Button */}
        <ToolbarButton 
          onClick={toggleQuickConnect} 
          text
          ref={quickConnectButtonRef}
          className={showQuickConnect ? 'active' : ''}
          title={hasConnections ? 'Quick Connect' : 'SSH Connect'}
        >
          <IconWrapper hasMargin>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3"/>
            </svg>
          </IconWrapper>
          {hasConnections ? 'Quick Connect' : 'SSH Connect'}
        </ToolbarButton>
        
        {/* SSH Connect Button */}
        <ToolbarButton onClick={onSSHClick} text>
          <IconWrapper hasMargin>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </IconWrapper>
          SSH
        </ToolbarButton>
        
        {/* Settings Button */}
        <ToolbarButton onClick={onSettingsClick}>
          <IconWrapper>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </IconWrapper>
        </ToolbarButton>
      </ToolbarActions>
      
      {/* Quick Connect Menu */}
      {showQuickConnect && (
        <QuickConnectMenu ref={quickConnectMenuRef}>
          <QuickConnectHeader>
            Saved Connections
            <span style={{ fontSize: '14px' }}>({savedConnections.length})</span>
          </QuickConnectHeader>
          
          <ConnectionList>
            {savedConnections.map(conn => (
              <ConnectionItem 
                key={conn.id}
                onClick={() => connectToSaved(conn)}
              >
                <ConnectionInfo>
                  <ConnectionName>{conn.name}</ConnectionName>
                  <ConnectionDetails>
                    {conn.username}@{conn.host}:{conn.port}
                  </ConnectionDetails>
                </ConnectionInfo>
                
                <IconWrapper>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </IconWrapper>
              </ConnectionItem>
            ))}
          </ConnectionList>
        </QuickConnectMenu>
      )}
    </ToolbarContainer>
  )
}

export default TerminalToolbar