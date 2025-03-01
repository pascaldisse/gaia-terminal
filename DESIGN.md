# Spaceflight Terminal Design Document

This document outlines the design principles and implementation details for the Spaceflight Terminal project.

## Design Principles

1. **Spaceship-inspired**: The terminal should visually mimic the [spaceship-prompt](https://github.com/spaceship-prompt/spaceship-prompt) aesthetic
2. **Modular**: Components should be independent and reusable
3. **Customizable**: Users should be able to enable/disable features
4. **Responsive**: The terminal should work well on various screen sizes
5. **Performance-focused**: Terminal operations should be smooth and efficient

## Color Palette

Based on a combination of Spaceship Prompt and Dracula theme:

| Color Name    | Hex Code  | Usage                       |
|---------------|-----------|----------------------------|
| Background    | `#1e1e2e` | Terminal background        |
| Foreground    | `#f8f8f2` | Regular text               |
| Comment       | `#6272a4` | Secondary text             |
| Selection     | `#44475a` | Selected text background   |
| Red           | `#ff5555` | Errors, exit codes         |
| Green         | `#50fa7b` | Success indicators         |
| Yellow        | `#f1fa8c` | Warnings, execution time   |
| Purple        | `#bd93f9` | Directory, hostname        |
| Pink          | `#ff79c6` | Git status, SSH            |
| Cyan          | `#8be9fd` | User, commands             |

## Terminal Prompt Design

The prompt should be modular and display the following sections:

1. **User & Host**: `username@hostname` (cyan/purple)
2. **Directory**: Current path (purple)
3. **Git Status**: Branch, status indicators (pink)
4. **Package Version**: Node/Python/etc. (yellow)
5. **Execution Time**: For long commands (yellow)
6. **Exit Code**: For failed commands (red/green)
7. **Symbol**: Arrow or custom symbol (green)

### Prompt Format (Example)

```
┌─[username@hostname] in [~/projects/spaceflight]
├─[⎇ main] [⚙ 0.5s] [✓]
└─➜ 
```

## Component Structure

### Core Components

1. **SpaceTerminal**: Main terminal component with xterm.js integration
2. **TerminalHeader**: Contains tabs and toolbar
3. **TerminalPrompt**: Handles rendering the spaceship-style prompt
4. **PromptSection**: Modular sections for the prompt
5. **SSHManager**: Handles SSH connections and credential management
6. **CommandProcessor**: Processes commands and manages history
7. **SettingsPanel**: User customization interface

### UI Elements

1. **Tabs**: Display open terminal sessions with icons
2. **Toolbar**: Contains actions and menu buttons
3. **Context Menu**: Right-click options for terminal
4. **Modal Dialogs**: For SSH connections, settings, etc.
5. **Status Bar**: Shows connection status and key information
6. **Tooltip**: Contextual help and information

## Implementation Priorities

1. **Phase 1**: Basic terminal with spaceship-style prompt
2. **Phase 2**: SSH connections and multi-tab interface
3. **Phase 3**: Terminal customization and settings
4. **Phase 4**: Advanced features (split panes, themes)

## Responsive Design Breakpoints

- **Mobile**: 320px - 768px (simplified interface)
- **Tablet**: 769px - 1024px (compact layout)
- **Desktop**: 1025px+ (full interface)

## Accessibility Considerations

- Color contrast ratios meet WCAG AA standards
- Keyboard navigation support
- Screen reader friendly elements
- Focus indicators