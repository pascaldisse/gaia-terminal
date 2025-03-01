import { useState } from 'react'
import styled from 'styled-components'
import { useTerminalStore } from '../../stores/terminalStore'

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`

const ModalContent = styled.div`
  background-color: var(--bg-secondary);
  border-radius: 8px;
  width: 100%;
  max-width: 500px;
  padding: 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
`

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`

const ModalTitle = styled.h2`
  color: var(--text-primary);
  font-size: 1.25rem;
  margin: 0;
`

const CloseButton = styled.button`
  background: transparent;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  
  &:hover {
    color: var(--text-primary);
  }
`

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Label = styled.label`
  color: var(--text-primary);
  font-size: 0.9rem;
`

const Input = styled.input`
  padding: 10px 12px;
  background-color: var(--bg-tertiary);
  border: 1px solid #444;
  border-radius: 4px;
  color: var(--text-primary);
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--accent-primary);
  }
`

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 8px;
`

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const CancelButton = styled(Button)`
  background-color: transparent;
  border: 1px solid #444;
  color: var(--text-primary);
  
  &:hover:not(:disabled) {
    background-color: var(--bg-tertiary);
  }
`

const ConnectButton = styled(Button)`
  background-color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #7d82d8;
  }
`

const SavedConnectionsList = styled.div`
  margin-top: 20px;
  border-top: 1px solid #444;
  padding-top: 16px;
`

const SavedConnectionsTitle = styled.h3`
  color: var(--text-primary);
  font-size: 1rem;
  margin: 0 0 12px 0;
`

const ConnectionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: var(--bg-tertiary);
  border-radius: 4px;
  margin-bottom: 8px;
  
  &:hover {
    background-color: #3a3a3a;
  }
`

const ConnectionInfo = styled.div`
  display: flex;
  flex-direction: column;
`

const ConnectionName = styled.span`
  color: var(--text-primary);
  font-weight: 500;
`

const ConnectionDetails = styled.span`
  color: var(--text-secondary);
  font-size: 0.8rem;
`

const ConnectionActions = styled.div`
  display: flex;
  gap: 8px;
`

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  
  &:hover {
    background-color: var(--bg-secondary);
    color: var(--text-primary);
  }
`

function SSHModal({ onClose }) {
  const [formData, setFormData] = useState({
    host: '',
    port: '22',
    username: '',
    password: '',
    privateKey: '',
    saveConnection: false,
    connectionName: ''
  })
  
  const [authType, setAuthType] = useState('password')
  const [formError, setFormError] = useState('')
  
  const { 
    sshConnections, 
    addSSHConnection, 
    removeSSHConnection, 
    activeTab, 
    setActiveConnection, 
    addTab 
  } = useTerminalStore()
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }
  
  const handleAuthTypeChange = (type) => {
    setAuthType(type)
  }
  
  const validateForm = () => {
    if (!formData.host) {
      setFormError('Host is required')
      return false
    }
    
    if (!formData.username) {
      setFormError('Username is required')
      return false
    }
    
    if (authType === 'password' && !formData.password) {
      setFormError('Password is required')
      return false
    }
    
    if (authType === 'privateKey' && !formData.privateKey) {
      setFormError('Private key is required')
      return false
    }
    
    if (formData.saveConnection && !formData.connectionName) {
      setFormError('Connection name is required to save')
      return false
    }
    
    setFormError('')
    return true
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const connectionConfig = {
      host: formData.host,
      port: parseInt(formData.port) || 22,
      username: formData.username,
      ...(authType === 'password' 
        ? { password: formData.password } 
        : { privateKey: formData.privateKey })
    }
    
    // Save connection if requested
    if (formData.saveConnection) {
      addSSHConnection({
        ...connectionConfig,
        name: formData.connectionName
      })
    }
    
    // Create a new tab for this connection
    const tabName = `SSH: ${formData.username}@${formData.host}`
    const newTabId = addTab(tabName)
    
    // Connect to the server (in this implementation, we store the connection
    // and the Terminal component handles the actual connection)
    const connectionId = addSSHConnection(connectionConfig)
    setActiveConnection(newTabId, connectionId)
    
    // Close the modal
    onClose()
  }
  
  const connectToSaved = (connection) => {
    // Create a new tab for this connection
    const tabName = `SSH: ${connection.username}@${connection.host}`
    const newTabId = addTab(tabName)
    
    // Set as active connection for the new tab
    setActiveConnection(newTabId, connection.id)
    
    // Close the modal
    onClose()
  }
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>SSH Connection</ModalTitle>
          <CloseButton onClick={onClose}>×</CloseButton>
        </ModalHeader>
        
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="host">Host</Label>
            <Input
              id="host"
              name="host"
              value={formData.host}
              onChange={handleChange}
              placeholder="hostname or IP address"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              name="port"
              value={formData.port}
              onChange={handleChange}
              placeholder="22"
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Authentication</Label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={authType === 'password'}
                  onChange={() => handleAuthTypeChange('password')}
                />
                <span>Password</span>
              </label>
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  checked={authType === 'privateKey'}
                  onChange={() => handleAuthTypeChange('privateKey')}
                />
                <span>Private Key</span>
              </label>
            </div>
          </FormGroup>
          
          {authType === 'password' ? (
            <FormGroup>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
              />
            </FormGroup>
          ) : (
            <FormGroup>
              <Label htmlFor="privateKey">Private Key</Label>
              <Input
                id="privateKey"
                name="privateKey"
                value={formData.privateKey}
                onChange={handleChange}
                placeholder="Paste your private key here"
                as="textarea"
                rows={4}
                style={{ resize: 'vertical' }}
              />
            </FormGroup>
          )}
          
          <FormGroup>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                name="saveConnection"
                checked={formData.saveConnection}
                onChange={handleChange}
              />
              <span>Save connection</span>
            </label>
          </FormGroup>
          
          {formData.saveConnection && (
            <FormGroup>
              <Label htmlFor="connectionName">Connection Name</Label>
              <Input
                id="connectionName"
                name="connectionName"
                value={formData.connectionName}
                onChange={handleChange}
                placeholder="My Server"
              />
            </FormGroup>
          )}
          
          {formError && (
            <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>
              {formError}
            </div>
          )}
          
          <ButtonGroup>
            <CancelButton type="button" onClick={onClose}>
              Cancel
            </CancelButton>
            <ConnectButton type="submit">
              Connect
            </ConnectButton>
          </ButtonGroup>
        </Form>
        
        {Object.keys(sshConnections).length > 0 && (
          <SavedConnectionsList>
            <SavedConnectionsTitle>Saved Connections</SavedConnectionsTitle>
            
            {Object.values(sshConnections)
              .filter(conn => conn.name) // Only show connections with names
              .map(connection => (
                <ConnectionItem key={connection.id}>
                  <ConnectionInfo>
                    <ConnectionName>{connection.name}</ConnectionName>
                    <ConnectionDetails>
                      {connection.username}@{connection.host}:{connection.port}
                    </ConnectionDetails>
                  </ConnectionInfo>
                  
                  <ConnectionActions>
                    <ActionButton 
                      onClick={() => connectToSaved(connection)}
                      title="Connect"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </ActionButton>
                    
                    <ActionButton 
                      onClick={() => removeSSHConnection(connection.id)}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        <line x1="10" y1="11" x2="10" y2="17"/>
                        <line x1="14" y1="11" x2="14" y2="17"/>
                      </svg>
                    </ActionButton>
                  </ConnectionActions>
                </ConnectionItem>
              ))
            }
          </SavedConnectionsList>
        )}
      </ModalContent>
    </ModalOverlay>
  )
}

export default SSHModal