import { useState, useEffect, useRef, useCallback } from 'react'
import styled from 'styled-components'
import { Terminal as XTerm } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { WebLinksAddon } from '@xterm/addon-web-links'
import { SearchAddon } from '@xterm/addon-search'
import '@xterm/xterm/css/xterm.css'
import { useTerminalStore } from '../../stores/terminalStore'

const TerminalContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: absolute;
  top: 0;
  left: 0;
  padding: 0.5rem;
  background-color: var(--bg-primary);
  display: ${props => props.visible ? 'block' : 'none'};
  
  /* Adjust terminal padding on mobile */
  @media (max-width: 600px) {
    padding: 0.25rem;
    height: 100%;
    width: 100%;
    bottom: 0;
    position: absolute;
  }
`

const ansiColors = {
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  brightBlack: '\x1b[90m',
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function Terminal({ id, visible }) {
  const terminalRef = useRef(null)
  const xtermRef = useRef(null)
  const fitAddonRef = useRef(null)
  const searchAddonRef = useRef(null)
  const promptRef = useRef('')
  const inputRef = useRef('')
  const wsRef = useRef(null)
  const sshActiveRef = useRef(false)
  
  const [ready, setReady] = useState(false)
  
  const {
    fontSize,
    fontFamily,
    theme,
    addCommand,
    getPreviousCommand,
    getNextCommand,
    resetHistoryIndex,
    environment,
    updateEnvironment,
    activeConnections,
    sshConnections
  } = useTerminalStore()

  // Initialize terminal
  useEffect(() => {
    if (!terminalRef.current) return

    // Create terminal instance
    xtermRef.current = new XTerm({
      cursorBlink: true,
      fontSize,
      fontFamily,
      theme,
      allowTransparency: true,
      scrollback: 10000,
      convertEol: true
    })

    // Add addons
    fitAddonRef.current = new FitAddon()
    searchAddonRef.current = new SearchAddon()
    const webLinksAddon = new WebLinksAddon()

    xtermRef.current.loadAddon(fitAddonRef.current)
    xtermRef.current.loadAddon(searchAddonRef.current)
    xtermRef.current.loadAddon(webLinksAddon)

    // Open terminal
    xtermRef.current.open(terminalRef.current)
    
    // Initial fit and welcome message
    setTimeout(() => {
      fitAddonRef.current.fit()
      
      // Welcome message
      xtermRef.current.writeln('Welcome to Gaia Terminal!')
      xtermRef.current.writeln('Type "help" for available commands.')
      xtermRef.current.writeln('')
      
      renderPrompt()
      setReady(true)
      
      // Additional fit for mobile devices with delayed layout
      setTimeout(() => {
        if (fitAddonRef.current) {
          fitAddonRef.current.fit()
        }
      }, 500)
    }, 100)

    // Handle window resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit()
        
        // Send terminal dimensions to SSH server if connected
        if (sshActiveRef.current && wsRef.current && xtermRef.current) {
          const { rows, cols } = xtermRef.current
          console.log(`[SSH Resize] Rows: ${rows}, Cols: ${cols}`)
          wsRef.current.send(JSON.stringify({
            type: 'resize',
            rows,
            cols
          }))
        }
        
        // For mobile devices, do an additional fit after a slight delay
        // This helps with virtual keyboard and orientation changes
        setTimeout(() => {
          if (fitAddonRef.current) {
            fitAddonRef.current.fit()
          }
        }, 300)
      }
    }
    window.addEventListener('resize', handleResize)
    
    // Also trigger resize on orientation change for mobile
    window.addEventListener('orientationchange', () => {
      setTimeout(handleResize, 100)
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
      
      // Close WebSocket if open
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close()
      }
      
      // Dispose terminal
      if (xtermRef.current) {
        xtermRef.current.dispose()
      }
    }
  }, [])

  // Apply theme changes
  useEffect(() => {
    if (xtermRef.current) {
      xtermRef.current.options.theme = theme
      xtermRef.current.options.fontSize = fontSize
      xtermRef.current.options.fontFamily = fontFamily
    }
  }, [theme, fontSize, fontFamily])

  // Handle visibility changes
  useEffect(() => {
    if (visible && fitAddonRef.current) {
      setTimeout(() => {
        fitAddonRef.current.fit()
      }, 10)
    }
  }, [visible])

  // Handle SSH connection changes
  useEffect(() => {
    const connectionId = activeConnections[id]
    
    // Close existing connection if open
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close()
      sshActiveRef.current = false
    }
    
    // If we have a new connection, set it up
    if (connectionId) {
      const connection = sshConnections[connectionId]
      if (connection) {
        connectSSH(connection)
      }
    }
  }, [activeConnections, id, sshConnections])

  // Generate and render prompt
  const generatePrompt = useCallback(() => {
    const { username, hostname, path, gitBranch, gitStatus } = environment
    
    // Determine emoji based on environment
    let statusEmoji = ' 🌍 '
    if (sshActiveRef.current) statusEmoji = ' 🔒 '
    
    // Build prompt sections with appropriate colors
    let prompt = `${ansiColors.brightGreen}${username}@${hostname}${ansiColors.reset} `
    
    // Current directory
    prompt += `${ansiColors.brightBlue}${path}${ansiColors.reset} `
    
    // Git information if available
    if (gitBranch) {
      // Status color based on git status
      const statusColor = gitStatus === 'clean' 
        ? ansiColors.green 
        : ansiColors.red
        
      prompt += `${ansiColors.magenta}(${gitBranch}) ${statusColor}[${gitStatus}]${ansiColors.reset} `
    }
    
    // Finish with spaceship prompt style
    prompt += `\r\n${statusEmoji}${ansiColors.brightCyan}❯${ansiColors.reset} `
    
    return prompt
  }, [environment])

  // Render prompt in terminal
  const renderPrompt = useCallback(() => {
    if (!xtermRef.current) return
    
    promptRef.current = generatePrompt()
    xtermRef.current.write(promptRef.current)
    inputRef.current = ''
  }, [generatePrompt])

  // Connect to SSH server
  const connectSSH = useCallback((connection) => {
    if (!xtermRef.current) return
    
    xtermRef.current.writeln(`\r\nConnecting to ${connection.host}...`)
    
    // Create WebSocket connection to backend
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws/ssh`)
    
    ws.onopen = () => {
      // Get current terminal dimensions
      const { rows, cols } = xtermRef.current
      console.log(`[SSH Connect] Initial dimensions - Rows: ${rows}, Cols: ${cols}`)
      
      ws.send(JSON.stringify({
        type: 'connect',
        ...connection,
        rows,
        cols
      }))
    }
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      
      if (data.type === 'connected') {
        sshActiveRef.current = true
        xtermRef.current.writeln(`\r\nConnected to ${connection.host}`)
        
        // Update environment for prompt
        updateEnvironment({
          hostname: connection.host,
          username: connection.username,
          path: '~'
        })
        
        renderPrompt()
      } else if (data.type === 'data') {
        xtermRef.current.write(data.data)
      } else if (data.type === 'error') {
        xtermRef.current.writeln(`\r\n${ansiColors.red}Error: ${data.message}${ansiColors.reset}`)
        sshActiveRef.current = false
        renderPrompt()
      } else if (data.type === 'close') {
        xtermRef.current.writeln(`\r\n${ansiColors.yellow}Connection closed${ansiColors.reset}`)
        sshActiveRef.current = false
        
        // Reset environment for prompt
        updateEnvironment({
          hostname: 'localhost',
          username: 'user',
          path: '~'
        })
        
        renderPrompt()
      }
    }
    
    ws.onerror = () => {
      xtermRef.current.writeln(`\r\n${ansiColors.red}WebSocket connection error${ansiColors.reset}`)
      sshActiveRef.current = false
      renderPrompt()
    }
    
    ws.onclose = () => {
      if (sshActiveRef.current) {
        xtermRef.current.writeln(`\r\n${ansiColors.yellow}Connection closed${ansiColors.reset}`)
        sshActiveRef.current = false
        
        // Reset environment for prompt
        updateEnvironment({
          hostname: 'localhost',
          username: 'user',
          path: '~'
        })
        
        renderPrompt()
      }
    }
    
    wsRef.current = ws
  }, [renderPrompt, updateEnvironment])

  // Process local commands
  const processCommand = useCallback((command) => {
    if (!xtermRef.current) return
    
    // Skip empty commands
    if (!command.trim()) {
      renderPrompt()
      return
    }
    
    // Save command to history
    addCommand(id, command)
    
    // Check if we're in SSH mode
    if (sshActiveRef.current && wsRef.current) {
      // Don't send anything - the Enter key will already have sent '\r'
      // We just store the command in history but don't send it again
      console.log(`[SSH Command] Command "${command}" already sent via key handler`)
      return
    }
    
    // Process local commands
    const args = command.trim().split(' ')
    const cmd = args[0].toLowerCase()
    
    // Add your command processing logic here
    switch (cmd) {
      case 'help':
        xtermRef.current.writeln('\r\nAvailable commands:')
        xtermRef.current.writeln('  help        - Show this help')
        xtermRef.current.writeln('  clear       - Clear the terminal')
        xtermRef.current.writeln('  echo [text] - Echo text to the terminal')
        xtermRef.current.writeln('  cd [path]   - Change directory (simulated)')
        xtermRef.current.writeln('  ls          - List files (simulated)')
        xtermRef.current.writeln('  pwd         - Print working directory')
        xtermRef.current.writeln('  exit        - Close current SSH connection or tab')
        xtermRef.current.writeln('')
        break
        
      case 'clear':
        xtermRef.current.clear()
        break
        
      case 'echo':
        xtermRef.current.writeln(`\r\n${args.slice(1).join(' ')}`)
        break
        
      case 'cd':
        // Simulate directory change
        const newPath = args[1] || '~'
        if (newPath === '~' || newPath === '/home/user') {
          updateEnvironment({ path: '~' })
        } else if (newPath === '..') {
          const currentPath = environment.path
          if (currentPath !== '~' && currentPath !== '/') {
            const parts = currentPath.split('/')
            parts.pop()
            updateEnvironment({ path: parts.join('/') || '/' })
          }
        } else if (newPath.startsWith('/')) {
          updateEnvironment({ path: newPath })
        } else {
          const currentPath = environment.path === '~' ? '/home/user' : environment.path
          const resolvedPath = `${currentPath}/${newPath}`
          updateEnvironment({ path: resolvedPath })
        }
        break
        
      case 'ls':
        // Simulate file listing based on current path
        xtermRef.current.writeln('\r\nDirectory listing (simulated):')
        if (environment.path === '~' || environment.path === '/home/user') {
          xtermRef.current.writeln('Documents  Downloads  Pictures  Projects')
        } else if (environment.path === '/') {
          xtermRef.current.writeln('bin  etc  home  usr  var')
        } else if (environment.path.includes('Projects')) {
          xtermRef.current.writeln('gaia-terminal  personal-site  react-app')
        } else {
          xtermRef.current.writeln('file1.txt  file2.js  folder1  folder2')
        }
        break
        
      case 'pwd':
        const displayPath = environment.path === '~' ? '/home/user' : environment.path
        xtermRef.current.writeln(`\r\n${displayPath}`)
        break
        
      case 'exit':
        if (sshActiveRef.current && wsRef.current) {
          wsRef.current.close()
          sshActiveRef.current = false
          
          // Reset environment for prompt
          updateEnvironment({
            hostname: 'localhost',
            username: 'user',
            path: '~'
          })
          
          xtermRef.current.writeln('\r\nSSH connection closed')
        }
        break
        
      default:
        xtermRef.current.writeln(`\r\n${ansiColors.red}Command not found: ${cmd}${ansiColors.reset}`)
    }
    
    renderPrompt()
  }, [id, environment, addCommand, updateEnvironment, renderPrompt])

  // Set up keyboard input handling
  useEffect(() => {
    if (!xtermRef.current || !ready) return
    
    const term = xtermRef.current
    const keyHandled = new Set() // Track keys that have been handled
    
    const handleKeyInput = (event) => {
      // Skip if not focused
      if (!visible) return
      
      // Create a unique identifier for this key event to prevent duplicates
      const eventId = `${event.timeStamp}-${event.key}`
      
      // Skip if we've already handled this exact key event
      if (keyHandled.has(eventId)) {
        console.log(`[SSH Key Skip] Duplicate key event: ${event.key}`)
        return
      }
      
      // Mark this event as handled
      keyHandled.add(eventId)
      
      // Clean up the set after a short delay to prevent memory leaks
      setTimeout(() => {
        keyHandled.delete(eventId)
      }, 100)
      
      // Check if we're in SSH mode
      if (sshActiveRef.current && wsRef.current) {
        // Pass keypresses to SSH connection with logging
        console.log(`[SSH Key Input] Key: ${event.key}, Ctrl: ${event.ctrlKey}, Alt: ${event.altKey}`)
        
        // Handle special keys and control sequences
        if (event.ctrlKey) {
          // Handle Ctrl key combinations (important for terminal applications)
          const ctrlChar = String.fromCharCode(event.key.toUpperCase().charCodeAt(0) - 64);
          console.log(`[SSH Control] Sending Ctrl+${event.key} as: ${ctrlChar.charCodeAt(0)}`)
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: ctrlChar
          }))
        } else if (event.key === 'Enter') {
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: '\r'
          }))
        } else if (event.key === 'Backspace') {
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: '\b'
          }))
        } else if (event.key === 'Tab') {
          event.preventDefault()
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: '\t'
          }))
        } else if (event.key === 'Escape') {
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: '\x1b'
          }))
        } else if (event.key === 'ArrowUp') {
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: '\x1b[A'
          }))
        } else if (event.key === 'ArrowDown') {
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: '\x1b[B'
          }))
        } else if (event.key === 'ArrowRight') {
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: '\x1b[C'
          }))
        } else if (event.key === 'ArrowLeft') {
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: '\x1b[D'
          }))
        } else if (event.key.length === 1) {
          // Only send actual characters (not function keys, etc)
          wsRef.current.send(JSON.stringify({
            type: 'data',
            data: event.key
          }))
        }
        
        return
      }

      const isPrintable = 
        !event.altKey && !event.ctrlKey && !event.metaKey &&
        event.key.length === 1
      
      if (isPrintable) {
        // Handle printable keys
        term.write(event.key)
        inputRef.current += event.key
      } else if (event.key === 'Enter') {
        // Handle Enter key
        term.writeln('\r')
        processCommand(inputRef.current)
        resetHistoryIndex(id)
      } else if (event.key === 'Backspace') {
        // Handle Backspace key
        if (inputRef.current.length > 0) {
          inputRef.current = inputRef.current.slice(0, -1)
          term.write('\b \b')
        }
      } else if (event.key === 'ArrowUp') {
        // Previous command from history
        const prevCommand = getPreviousCommand(id)
        if (prevCommand !== null) {
          // Clear current input
          const inputLength = inputRef.current.length
          term.write('\r' + ' '.repeat(promptRef.current.length + inputLength) + '\r')
          term.write(promptRef.current)
          
          // Write new command
          term.write(prevCommand)
          inputRef.current = prevCommand
        }
      } else if (event.key === 'ArrowDown') {
        // Next command from history
        const nextCommand = getNextCommand(id)
        
        // Clear current input
        const inputLength = inputRef.current.length
        term.write('\r' + ' '.repeat(promptRef.current.length + inputLength) + '\r')
        term.write(promptRef.current)
        
        // Write new command
        term.write(nextCommand || '')
        inputRef.current = nextCommand || ''
      } else if (event.key === 'Tab') {
        // Simple tab completion (just for demonstration)
        event.preventDefault()
        
        const commonCommands = ['help', 'clear', 'echo', 'cd', 'ls', 'pwd', 'exit']
        const input = inputRef.current.trim()
        
        // Only autocomplete at the start of the command
        if (!input.includes(' ')) {
          const matches = commonCommands.filter(cmd => cmd.startsWith(input))
          
          if (matches.length === 1) {
            // Clear current input
            const inputLength = inputRef.current.length
            term.write('\r' + ' '.repeat(promptRef.current.length + inputLength) + '\r')
            term.write(promptRef.current)
            
            // Write completed command
            term.write(matches[0] + ' ')
            inputRef.current = matches[0] + ' '
          } else if (matches.length > 1) {
            // Show available completions
            term.writeln('\r')
            term.writeln(matches.join('  '))
            renderPrompt()
            term.write(input)
            inputRef.current = input
          }
        }
      }
    }
    
    // Use direct DOM key event instead of terminal's key event handler
    // This gives us more control over event handling
    const domKeyHandler = (domEvent) => {
      // Only handle keyboard events when this terminal is visible
      if (visible) {
        handleKeyInput(domEvent)
      }
    }
    
    // Add our own key event listener to the document
    document.addEventListener('keydown', domKeyHandler)
    
    // Remove xterm's built-in key handler
    term.attachCustomKeyEventHandler(() => {
      // Return false for all keys when in SSH mode to prevent xterm handling
      return !sshActiveRef.current
    })

    // Focus terminal on click
    term.onSelectionChange(() => {
      // When selection is empty and terminal is clicked, focus it
      if (term.getSelection().length === 0) {
        term.focus()
      }
    })

    // Initial focus
    if (visible) {
      setTimeout(() => {
        term.focus()
      }, 100)
    }

    return () => {
      // Clean up event listeners
      document.removeEventListener('keydown', domKeyHandler)
    }
  }, [id, visible, ready, processCommand, getPreviousCommand, getNextCommand, resetHistoryIndex, renderPrompt])

  return (
    <TerminalContainer visible={visible} ref={terminalRef} />
  )
}

export default Terminal