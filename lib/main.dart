import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'screens/home_screen.dart';
import 'services/terminal_service.dart';
import 'package:flutter/foundation.dart';

void main() {
  // Enable verbose logging in debug mode
  if (kDebugMode) {
    debugPrint = (String? message, {int? wrapWidth}) {
      if (message != null) {
        debugPrintSynchronously(
          "GAIA DEBUG: $message",
          wrapWidth: wrapWidth,
        );
      }
    };
    
    debugPrint('Gaia Terminal starting with enhanced logging');
  }
  
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (context) => TerminalService()),
      ],
      child: const GaiaTerminalApp(),
    ),
  );
}

class GaiaTerminalApp extends StatelessWidget {
  const GaiaTerminalApp({super.key});

  @override
  Widget build(BuildContext context) {
    final terminalService = Provider.of<TerminalService>(context);
    return MaterialApp(
      title: 'Gaia Terminal',
      theme: ThemeData(
        brightness: terminalService.currentTheme == TerminalTheme.light 
            ? Brightness.light 
            : Brightness.dark,
        colorScheme: terminalService.currentTheme == TerminalTheme.light
            ? ColorScheme.light(
                primary: Colors.blue,
                secondary: Colors.blueAccent,
                surface: terminalService.currentTheme.background,
              ) 
            : ColorScheme.dark(
                primary: Colors.blue,
                secondary: Colors.blueAccent,
                surface: terminalService.currentTheme.background,
              ),
        scaffoldBackgroundColor: terminalService.currentTheme.background,
      ),
      home: const HomeScreen(),
    );
  }
}
