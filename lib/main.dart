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
    return MaterialApp(
      title: 'Gaia Terminal',
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: ColorScheme.dark(
          primary: Colors.blue,
          secondary: Colors.blueAccent,
        ),
        scaffoldBackgroundColor: const Color(0xFF1E1E1E),
      ),
      home: const HomeScreen(),
    );
  }
}
