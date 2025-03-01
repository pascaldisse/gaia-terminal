import { useState } from 'react'
import styled from 'styled-components'
import { useTerminalStore } from '../../stores/terminalStore'

const TabsContainer = styled.div`
  display: flex;
  height: 40px;
  background-color: var(--bg-secondary);
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  border-bottom: 1px solid var(--bg-tertiary);
`

const Tab = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 100%;
  cursor: pointer;
  color: ${props => props.active ? 'var(--text-primary)' : 'var(--text-secondary)'};
  background-color: ${props => props.active ? 'var(--bg-primary)' : 'transparent'};
  border-right: 1px solid var(--bg-tertiary);
  user-select: none;
  min-width: 120px;
  position: relative;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--bg-primary)' : 'var(--bg-tertiary)'};
  }
  
  &:hover .close-button {
    opacity: 1;
  }
`

const TabName = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  opacity: 0.5;
  padding: 0;
  margin-left: 8px;
  font-size: 14px;
  line-height: 1;
  transition: opacity 0.2s, background-color 0.2s;
  
  &:hover {
    background-color: var(--error);
    color: white;
  }
`

const AddTabButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 100%;
  border: none;
  background-color: transparent;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 20px;
  padding: 0 16px;
  
  &:hover {
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
  }
`

function TerminalTabs() {
  const { tabs, activeTab, addTab, closeTab, setActiveTab } = useTerminalStore()
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [editId, setEditId] = useState(null)
  
  const handleDoubleClick = (tab) => {
    setIsEditing(true)
    setEditId(tab.id)
    setEditValue(tab.name)
  }
  
  const handleEditSubmit = () => {
    if (editValue.trim() !== '') {
      // Update tab name
      const updatedTabs = tabs.map(tab => 
        tab.id === editId ? { ...tab, name: editValue.trim() } : tab
      )
      
      // Update store (simplified as we don't have direct setter)
      useTerminalStore.setState({ tabs: updatedTabs })
    }
    
    setIsEditing(false)
    setEditId(null)
  }
  
  return (
    <TabsContainer>
      {tabs.map(tab => (
        <Tab 
          key={tab.id} 
          active={tab.id === activeTab}
          onClick={() => setActiveTab(tab.id)}
          onDoubleClick={() => handleDoubleClick(tab)}
        >
          {isEditing && tab.id === editId ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEditSubmit}
              onKeyDown={(e) => e.key === 'Enter' && handleEditSubmit()}
              autoFocus
              style={{ 
                background: 'transparent', 
                border: 'none', 
                outline: 'none',
                color: 'inherit',
                width: '100%'
              }}
            />
          ) : (
            <TabName>{tab.name}</TabName>
          )}
          
          <CloseButton 
            className="close-button"
            onClick={(e) => {
              e.stopPropagation()
              closeTab(tab.id)
            }}
            title="Close tab"
          >
            ×
          </CloseButton>
        </Tab>
      ))}
      
      <AddTabButton 
        onClick={() => addTab('New Terminal')}
        title="New terminal tab"
      >
        +
      </AddTabButton>
    </TabsContainer>
  )
}

export default TerminalTabs