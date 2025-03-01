import styled from 'styled-components'

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
`

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.hasMargin ? '6px' : '0'};
`

function TerminalToolbar({ onSettingsClick, onSSHClick }) {
  return (
    <ToolbarContainer>
      <ToolbarTitle>Gaia Terminal</ToolbarTitle>
      
      <ToolbarActions>
        <ToolbarButton onClick={onSSHClick} text>
          <IconWrapper hasMargin>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </IconWrapper>
          SSH Connect
        </ToolbarButton>
        
        <ToolbarButton onClick={onSettingsClick}>
          <IconWrapper>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </IconWrapper>
        </ToolbarButton>
      </ToolbarActions>
    </ToolbarContainer>
  )
}

export default TerminalToolbar