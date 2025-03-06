/**
 * Bridge between Native and Web for handling WebSocket
 * This allows us to use the same code on both platforms
 */

import { Platform } from 'react-native';

// This handles the differences between React Native WebSocket and browser WebSocket
class WebSocketAdapter {
  static createWebSocket(url) {
    if (Platform.OS === 'web') {
      // Use the browser's WebSocket implementation
      return new window.WebSocket(url);
    } else {
      // Use React Native's WebSocket implementation
      return new global.WebSocket(url);
    }
  }
}

export default WebSocketAdapter;