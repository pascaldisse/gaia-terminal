import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/terminal_service.dart';

class SettingsPanel extends StatelessWidget {
  const SettingsPanel({super.key});

  @override
  Widget build(BuildContext context) {
    final terminalService = Provider.of<TerminalService>(context);
    
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey[850],
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(128),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(-2, 0),
          ),
        ],
      ),
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Settings',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              IconButton(
                icon: const Icon(Icons.close, color: Colors.white),
                onPressed: () => terminalService.toggleSettings(),
              ),
            ],
          ),
          const Divider(color: Colors.grey),
          const SizedBox(height: 16),
          const Text(
            'Font Size',
            style: TextStyle(color: Colors.white),
          ),
          Slider(
            value: terminalService.fontSize,
            min: 8,
            max: 20,
            divisions: 12,
            label: terminalService.fontSize.round().toString(),
            onChanged: (value) => terminalService.updateFontSize(value),
          ),
          const SizedBox(height: 16),
          const Text(
            'Theme',
            style: TextStyle(color: Colors.white),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8.0,
            runSpacing: 8.0,
            children: TerminalTheme.values.map((theme) {
              return _themeOption(
                context, 
                theme.displayName, 
                theme.name, 
                terminalService.theme, 
                terminalService.setTheme,
              );
            }).toList(),
          ),
          const Spacer(),
          const Text(
            'Gaia Terminal v1.0.0',
            style: TextStyle(
              color: Colors.grey,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  Widget _themeOption(
    BuildContext context, 
    String label, 
    String value, 
    String currentTheme, 
    Function(String) onSelect,
  ) {
    final isSelected = value == currentTheme;
    
    return InkWell(
      onTap: () => onSelect(value),
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 8,
        ),
        decoration: BoxDecoration(
          color: isSelected ? Colors.blue : Colors.grey[800],
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          label,
          style: const TextStyle(color: Colors.white),
        ),
      ),
    );
  }
}