import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { useTerminalStore } from '../../stores/terminalStore'

const PanelContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 350px;
  height: 100%;
  background-color: var(--bg-secondary);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
  z-index: 100;
  overflow-y: auto;
  animation: slideIn 0.2s ease-out;
  
  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }
`

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--bg-tertiary);
`

const PanelTitle = styled.h2`
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
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

const PanelContent = styled.div`
  padding: 20px;
`

const SettingsSection = styled.div`
  margin-bottom: 24px;
`

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 600;
`

const FormGroup = styled.div`
  margin-bottom: 16px;
`

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  color: var(--text-primary);
  font-size: 0.9rem;
`

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
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

const Select = styled.select`
  width: 100%;
  padding: 8px 12px;
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

const ColorSwatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${props => props.color};
  cursor: pointer;
  border: 2px solid ${props => props.selected ? 'var(--accent-primary)' : 'transparent'};
`

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin-top: 8px;
`

const SaveButton = styled.button`
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  background-color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
  color: white;
  margin-top: 16px;
  
  &:hover {
    background-color: #7d82d8;
  }
`

function SettingsPanel({ onClose }) {
  const { fontSize, fontFamily, theme, updateSettings } = useTerminalStore()
  
  const [settings, setSettings] = useState({
    fontSize,
    fontFamily,
    theme: { ...theme }
  })
  
  // Available font families
  const fontFamilies = [
    'JetBrains Mono, monospace',
    'Fira Code, monospace',
    'Inconsolata, monospace',
    'Source Code Pro, monospace',
    'Menlo, monospace',
    'Consolas, monospace',
    'Monaco, monospace',
    'Ubuntu Mono, monospace'
  ]
  
  // Color themes
  const colorThemes = [
    {
      name: 'Dark (Default)',
      colors: {
        background: '#1a1a1a',
        foreground: '#e0e0e0',
        cursor: '#6c71c4',
        selection: 'rgba(108, 113, 196, 0.3)'
      }
    },
    {
      name: 'Solarized Dark',
      colors: {
        background: '#002b36',
        foreground: '#839496',
        cursor: '#93a1a1',
        selection: 'rgba(147, 161, 161, 0.3)'
      }
    },
    {
      name: 'Monokai',
      colors: {
        background: '#272822',
        foreground: '#f8f8f2',
        cursor: '#f8f8f0',
        selection: 'rgba(73, 72, 62, 0.5)'
      }
    },
    {
      name: 'Nord',
      colors: {
        background: '#2e3440',
        foreground: '#d8dee9',
        cursor: '#88c0d0',
        selection: 'rgba(136, 192, 208, 0.3)'
      }
    },
    {
      name: 'Dracula',
      colors: {
        background: '#282a36',
        foreground: '#f8f8f2',
        cursor: '#bd93f9',
        selection: 'rgba(68, 71, 90, 0.5)'
      }
    },
    {
      name: 'GitHub Dark',
      colors: {
        background: '#0d1117',
        foreground: '#c9d1d9',
        cursor: '#58a6ff',
        selection: 'rgba(56, 139, 253, 0.3)'
      }
    }
  ]
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setSettings(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleThemeChange = (themeName) => {
    const selectedTheme = colorThemes.find(theme => theme.name === themeName)
    if (selectedTheme) {
      setSettings(prev => ({
        ...prev,
        theme: {
          ...prev.theme,
          ...selectedTheme.colors
        }
      }))
    }
  }
  
  const handleColorChange = (colorKey, colorValue) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [colorKey]: colorValue
      }
    }))
  }
  
  const handleSave = () => {
    updateSettings(settings)
    onClose()
  }
  
  // Color swatches for terminal colors
  const colorSwatches = [
    { key: 'black', name: 'Black' },
    { key: 'red', name: 'Red' },
    { key: 'green', name: 'Green' },
    { key: 'yellow', name: 'Yellow' },
    { key: 'blue', name: 'Blue' },
    { key: 'magenta', name: 'Magenta' },
    { key: 'cyan', name: 'Cyan' },
    { key: 'white', name: 'White' },
    { key: 'brightBlack', name: 'Bright Black' },
    { key: 'brightRed', name: 'Bright Red' },
    { key: 'brightGreen', name: 'Bright Green' },
    { key: 'brightYellow', name: 'Bright Yellow' },
    { key: 'brightBlue', name: 'Bright Blue' },
    { key: 'brightMagenta', name: 'Bright Magenta' },
    { key: 'brightCyan', name: 'Bright Cyan' },
    { key: 'brightWhite', name: 'Bright White' }
  ]
  
  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>Settings</PanelTitle>
        <CloseButton onClick={onClose}>×</CloseButton>
      </PanelHeader>
      
      <PanelContent>
        <SettingsSection>
          <SectionTitle>Font</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="fontSize">Font Size</Label>
            <Input
              type="number"
              id="fontSize"
              name="fontSize"
              min="8"
              max="32"
              value={settings.fontSize}
              onChange={handleChange}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="fontFamily">Font Family</Label>
            <Select
              id="fontFamily"
              name="fontFamily"
              value={settings.fontFamily}
              onChange={handleChange}
            >
              {fontFamilies.map(font => (
                <option key={font} value={font}>
                  {font.split(',')[0]}
                </option>
              ))}
            </Select>
          </FormGroup>
        </SettingsSection>
        
        <SettingsSection>
          <SectionTitle>Theme</SectionTitle>
          
          <FormGroup>
            <Label>Preset Themes</Label>
            <Select
              onChange={(e) => handleThemeChange(e.target.value)}
              value=""
            >
              <option value="" disabled>Select a theme...</option>
              {colorThemes.map(theme => (
                <option key={theme.name} value={theme.name}>
                  {theme.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="background">Background Color</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Input
                type="color"
                id="background"
                value={settings.theme.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
                style={{ width: '40px', padding: '2px' }}
              />
              <Input
                type="text"
                value={settings.theme.background}
                onChange={(e) => handleColorChange('background', e.target.value)}
              />
            </div>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="foreground">Foreground Color</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Input
                type="color"
                id="foreground"
                value={settings.theme.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
                style={{ width: '40px', padding: '2px' }}
              />
              <Input
                type="text"
                value={settings.theme.foreground}
                onChange={(e) => handleColorChange('foreground', e.target.value)}
              />
            </div>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="cursor">Cursor Color</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Input
                type="color"
                id="cursor"
                value={settings.theme.cursor}
                onChange={(e) => handleColorChange('cursor', e.target.value)}
                style={{ width: '40px', padding: '2px' }}
              />
              <Input
                type="text"
                value={settings.theme.cursor}
                onChange={(e) => handleColorChange('cursor', e.target.value)}
              />
            </div>
          </FormGroup>
          
          <FormGroup>
            <Label>Terminal Colors</Label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              marginTop: '8px'
            }}>
              {colorSwatches.map(swatch => (
                <div key={swatch.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Input
                    type="color"
                    value={settings.theme[swatch.key] || '#000000'}
                    onChange={(e) => handleColorChange(swatch.key, e.target.value)}
                    style={{ width: '24px', height: '24px', padding: '2px' }}
                  />
                  <span style={{ fontSize: '0.85rem' }}>{swatch.name}</span>
                </div>
              ))}
            </div>
          </FormGroup>
        </SettingsSection>
        
        <SaveButton onClick={handleSave}>
          Save Settings
        </SaveButton>
      </PanelContent>
    </PanelContainer>
  )
}

export default SettingsPanel