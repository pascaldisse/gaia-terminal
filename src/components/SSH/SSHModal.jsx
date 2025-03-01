import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTerminalStore } from '../../stores/terminalStore';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideIn = keyframes`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background-color: #282a36;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
  width: 450px;
  padding: 24px;
  color: #f8f8f2;
  animation: ${slideIn} 0.3s ease-out;
  border: 1px solid #44475a;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  h2 {
    margin: 0;
    color: #bd93f9;
    font-size: 18px;
    font-weight: 600;
    display: flex;
    align-items: center;
    
    svg {
      margin-right: 10px;
    }
  }
  
  button {
    background: none;
    border: none;
    color: #f8f8f2;
    font-size: 20px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s;
    
    &:hover {
      background-color: rgba(255, 85, 85, 0.2);
      color: #ff5555;
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 18px;
  
  label {
    display: block;
    margin-bottom: 8px;
    color: #8be9fd;
    font-size: 14px;
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 10px 12px;
    background-color: #1e1e2e;
    border: 1px solid #44475a;
    border-radius: 4px;
    color: #f8f8f2;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    transition: all 0.2s;
    
    &:focus {
      outline: none;
      border-color: #bd93f9;
      box-shadow: 0 0 0 1px rgba(189, 147, 249, 0.3);
    }
    
    &::placeholder {
      color: #6272a4;
    }
  }
  
  textarea {
    resize: vertical;
    min-height: 120px;
  }
`;

const InlineFormGroup = styled.div`
  display: flex;
  gap: 12px;
  
  ${FormGroup} {
    flex: 1;
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
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(189, 147, 249, 0.5);
    }
  }
  
  &.secondary {
    background-color: #21222c;
    border: 1px solid #44475a;
    color: #f8f8f2;
    
    &:hover {
      border-color: #bd93f9;
      background-color: #2c2d3d;
    }
    
    &:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(189, 147, 249, 0.3);
    }
  }
`;

const RecentConnectionsList = styled.div`
  margin-top: 20px;
  
  h3 {
    color: #6272a4;
    font-size: 14px;
    margin-bottom: 8px;
    font-weight: normal;
  }
  
  ul {
    list-style: none;
    padding: 0;
    margin: 0;
    max-height: 120px;
    overflow-y: auto;
    
    &::-webkit-scrollbar {
      width: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background-color: #21222c;
    }
    
    &::-webkit-scrollbar-thumb {
      background-color: #44475a;
      border-radius: 4px;
    }
  }
  
  li {
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    
    &:hover {
      background-color: #2c2d3d;
    }
    
    .icon {
      color: #ff79c6;
      margin-right: 8px;
    }
    
    .connection-name {
      color: #f8f8f2;
    }
  }
`;

// SSH Icon
const SSHIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 7L19 11L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 11H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 5V3C9 2.44772 8.55228 2 8 2H4C3.44772 2 3 2.44772 3 3V21C3 21.5523 3.44772 22 4 22H8C8.55228 22 9 21.5523 9 21V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SSHModal = ({ isOpen, onClose }) => {
  const [host, setHost] = useState('');
  const [port, setPort] = useState('22');
  const [username, setUsername] = useState('');
  const [authType, setAuthType] = useState('password');
  const [password, setPassword] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [rememberCredentials, setRememberCredentials] = useState(true);
  
  const { addSSHConnection, sshConnections } = useTerminalStore(state => ({
    addSSHConnection: state.addSSHConnection,
    sshConnections: state.sshConnections || []
  }));
  
  // Mock recent connections for demo
  const recentConnections = [
    { id: '1', host: 'remote-server.example.com', username: 'admin' },
    { id: '2', host: 'dev-machine.local', username: 'developer' },
    { id: '3', host: '192.168.1.10', username: 'root' }
  ];
  
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
      title: username ? `${username}@${host}` : host,
      type: 'ssh',
      hostname: host
    };
    
    // Add to store
    addSSHConnection(connection);
    
    // Close modal
    onClose();
  };
  
  const selectRecentConnection = (conn) => {
    setHost(conn.host);
    setUsername(conn.username);
    setPort('22');
  };
  
  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContent>
        <ModalHeader>
          <h2>
            <SSHIcon />
            SSH Connection
          </h2>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>
        
        <FormGroup>
          <label>Host</label>
          <input 
            type="text" 
            value={host} 
            onChange={(e) => setHost(e.target.value)}
            placeholder="hostname or IP address"
            autoFocus
          />
        </FormGroup>
        
        <InlineFormGroup>
          <FormGroup>
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)}
              placeholder="username"
            />
          </FormGroup>
          
          <FormGroup>
            <label>Port</label>
            <input 
              type="text" 
              value={port} 
              onChange={(e) => setPort(e.target.value)}
              placeholder="22"
            />
          </FormGroup>
        </InlineFormGroup>
        
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
              placeholder="Enter password"
              autoComplete="current-password"
            />
          </FormGroup>
        ) : (
          <FormGroup>
            <label>Private Key</label>
            <textarea 
              value={privateKey} 
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Paste your private key here or use a path to a key file"
            />
          </FormGroup>
        )}
        
        <FormGroup>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={rememberCredentials} 
              onChange={(e) => setRememberCredentials(e.target.checked)}
              style={{ marginRight: '8px' }}
            />
            Remember credentials
          </label>
        </FormGroup>
        
        {recentConnections.length > 0 && (
          <RecentConnectionsList>
            <h3>Recent Connections</h3>
            <ul>
              {recentConnections.map(conn => (
                <li key={conn.id} onClick={() => selectRecentConnection(conn)}>
                  <span className="icon">⚡</span>
                  <span className="connection-name">{conn.username}@{conn.host}</span>
                </li>
              ))}
            </ul>
          </RecentConnectionsList>
        )}
        
        <ButtonRow>
          <Button className="secondary" onClick={onClose}>Cancel</Button>
          <Button 
            className="primary" 
            onClick={handleConnect}
            disabled={!host.trim()}
          >
            Connect
          </Button>
        </ButtonRow>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SSHModal;