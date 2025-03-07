/**
 * SSH Service for handling WebSocket connections to the SSH server
 */
import WebSocketAdapter from './native-web-bridge';

class SSHService {
  constructor() {
    this.connections = {};
    this.config = {
      serverUrl: 'ws://localhost:5000/ws/ssh'
    };
  }

  /**
   * Connect to an SSH server
   * 
   * @param {Object} connectionDetails - The connection details
   * @param {string} connectionDetails.host - The hostname
   * @param {string} connectionDetails.username - The username
   * @param {string} connectionDetails.password - The password (optional)
   * @param {string} connectionDetails.privateKey - The private key (optional)
   * @param {number} connectionDetails.port - The port
   * @param {number} connectionDetails.rows - Terminal rows
   * @param {number} connectionDetails.cols - Terminal columns
   * @param {Function} onData - Callback for data
   * @param {Function} onConnect - Callback for connection success
   * @param {Function} onClose - Callback for connection close
   * @param {Function} onError - Callback for connection error
   * @returns {string} - Connection ID
   */
  connect(connectionDetails, onData, onConnect, onClose, onError) {
    try {
      const ws = WebSocketAdapter.createWebSocket(this.config.serverUrl);
      const connectionId = Date.now().toString();
      
      ws.onopen = () => {
        const payload = {
          type: 'connect',
          ...connectionDetails
        };
        ws.send(JSON.stringify(payload));
      };
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connected':
            this.connections[connectionId] = { ws, ...connectionDetails };
            if (onConnect) onConnect(data);
            break;
          case 'data':
            if (onData) onData(data.data);
            break;
          case 'error':
            if (onError) onError(data.message);
            break;
          case 'close':
            this.disconnect(connectionId);
            if (onClose) onClose();
            break;
        }
      };
      
      ws.onerror = (error) => {
        if (onError) onError('WebSocket error: ' + error.message);
      };
      
      ws.onclose = () => {
        delete this.connections[connectionId];
        if (onClose) onClose();
      };
      
      return connectionId;
    } catch (error) {
      if (onError) onError('Failed to connect: ' + error.message);
      return null;
    }
  }
  
  /**
   * Send data to an SSH connection
   * 
   * @param {string} connectionId - The connection ID
   * @param {string} data - The data to send
   * @returns {boolean} - Success status
   */
  sendData(connectionId, data) {
    const connection = this.connections[connectionId];
    if (!connection || !connection.ws) return false;
    
    try {
      connection.ws.send(JSON.stringify({
        type: 'data',
        data
      }));
      return true;
    } catch (error) {
      console.error('Failed to send data:', error);
      return false;
    }
  }
  
  /**
   * Disconnect from an SSH server
   * 
   * @param {string} connectionId - The connection ID
   */
  disconnect(connectionId) {
    const connection = this.connections[connectionId];
    if (!connection || !connection.ws) return;
    
    try {
      connection.ws.close();
    } catch (error) {
      console.error('Error closing connection:', error);
    }
    
    delete this.connections[connectionId];
  }
  
  /**
   * Resize the terminal for an active SSH connection
   * 
   * @param {string} connectionId - The connection ID 
   * @param {number} cols - New number of columns
   * @param {number} rows - New number of rows
   * @returns {boolean} - Success status
   */
  resizeTerminal(connectionId, cols, rows) {
    const connection = this.connections[connectionId];
    if (!connection || !connection.ws) return false;
    
    try {
      connection.ws.send(JSON.stringify({
        type: 'resize',
        cols,
        rows
      }));
      return true;
    } catch (error) {
      console.error('Failed to resize terminal:', error);
      return false;
    }
  }
  
  /**
   * Check if a connection is active
   * 
   * @param {string} connectionId - The connection ID
   * @returns {boolean} - Is connected
   */
  isConnected(connectionId) {
    return !!this.connections[connectionId];
  }
  
  /**
   * Set server URL
   * 
   * @param {string} url - The server URL
   */
  setServerUrl(url) {
    this.config.serverUrl = url;
  }
}

// Export singleton instance
export default new SSHService();