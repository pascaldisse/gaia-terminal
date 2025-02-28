import React, { useState } from 'react';
import styled from 'styled-components';
import { useTerminalStore } from '../../stores/terminalStore';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`;

const ModalContent = styled.div`
  background-color: #282a36;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  width: 400px;
  padding: 24px;
  color: #f8f8f2;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: #bd93f9;
  }
  
  button {
    background: none;
    border: none;
    color: #f8f8f2;
    font-size: 20px;
    cursor: pointer;
    
    &:hover {
      color: #ff5555;
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: #8be9fd;
  }
  
  input, select {
    width: 100%;
    padding: 10px;
    background-color: #44475a;
    border: 1px solid #6272a4;
    border-radius: 4px;
    color: #f8f8f2;
    font-family: 'JetBrains Mono', monospace;
    
    &:focus {
      outline: none;
      border-color: #ff79c6;
    }
  }
`;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 10px 16px;
  border-radius: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &.primary {
    background-color: #bd93f9;
    color: #282a36;
    border: none;
    
    &:hover {
      background-color: #a57aed;
    }
  }
  
  &.secondary {
    background-color: transparent;
    border: 1px solid #6272a4;
    color: #f8f8f2;
    
    &:hover {
      border-color: #ff79c6;
      color: #ff79c6;
    }
  }
`;

const SSHModal = ({ isOpen, onClose }) => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [authType, setAuthType] = useState('password');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  
  const { addSSHConnection } = useTerminalStore();
  
  if (!isOpen) return null;
  
  const handleConnect = () => {
    // Create new SSH connection object
    const connection = {
      id: Date.now().toString(),
      host,
      port: parseInt(port, 10),
      username,
      authType,
      credentials: authType === 'password' ? password : privateKey,
      status: 'connecting',
    };
    
    // Add to store
    addSSHConnection(connection);
    
    // Close modal
    onClose();
    
    // In a real app, we would initiate the SSH connection here
    // For this demo, we'll just simulate a connection via the Terminal component
  };
  
  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h2>SSH Connection</h2>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>
        
        <FormGroup>
          <label>Host</label>
          <input 
            type="text" 
            value={host} 
            onChange={(e) => setHost(e.target.value)}
            placeholder="hostname or IP address"
          />
        </FormGroup>
        
        <FormGroup>
          <label>Port</label>
          <input 
            type="text" 
            value={port} 
            onChange={(e) => setPort(e.target.value)}
          />
        </FormGroup>
        
        <FormGroup>
          <label>Username</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
          />
        </FormGroup>
        
        <FormGroup>
          <label>Authentication</label>
          <select 
            value={authType} 
            onChange={(e) => setAuthType(e.target.value)}
          >
            <option value="password">Password</option>
            <option value="key">Private Key</option>
          </select>
        </FormGroup>
        
        {authType === 'password' ? (
          <FormGroup>
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormGroup>
        ) : (
          <FormGroup>
            <label>Private Key</label>
            <textarea 
              value={privateKey} 
              onChange={(e) => setPrivateKey(e.target.value)}
              rows={4}
              style={{ 
                width: '100%', 
                backgroundColor: '#44475a',
                border: '1px solid #6272a4',
                borderRadius: '4px',
                color: '#f8f8f2',
                fontFamily: '"JetBrains Mono", monospace',
                padding: '10px'
              }}
              placeholder="Paste your private key here"
            />
          </FormGroup>
        )}
        
        <ButtonRow>
          <Button className="secondary" onClick={onClose}>Cancel</Button>
          <Button className="primary" onClick={handleConnect}>Connect</Button>
        </ButtonRow>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SSHModal;