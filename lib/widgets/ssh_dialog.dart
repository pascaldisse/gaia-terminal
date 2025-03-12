import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/terminal_service.dart';

class SSHDialog extends StatefulWidget {
  const SSHDialog({Key? key}) : super(key: key);

  @override
  State<SSHDialog> createState() => _SSHDialogState();
}

class _SSHDialogState extends State<SSHDialog> {
  final _formKey = GlobalKey<FormState>();
  final _hostController = TextEditingController();
  final _portController = TextEditingController(text: '22');
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _connectionNameController = TextEditingController();
  bool _isConnecting = false;
  bool _saveConnection = true;
  int _selectedTabIndex = 0; // 0 = New Connection, 1 = Saved Connections

  @override
  void dispose() {
    _hostController.dispose();
    _portController.dispose();
    _usernameController.dispose();
    _passwordController.dispose();
    _connectionNameController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final terminalService = Provider.of<TerminalService>(context);
    
    return AlertDialog(
      title: const Text('SSH Connection'),
      content: SizedBox(
        width: 500,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Tabs for New Connection / Saved Connections
            Row(
              children: [
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _selectedTabIndex = 0),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _selectedTabIndex == 0 
                                ? Theme.of(context).primaryColor 
                                : Colors.grey,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Center(
                        child: Text(
                          'New Connection',
                          style: TextStyle(
                            fontWeight: _selectedTabIndex == 0 
                                ? FontWeight.bold 
                                : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _selectedTabIndex = 1),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        border: Border(
                          bottom: BorderSide(
                            color: _selectedTabIndex == 1 
                                ? Theme.of(context).primaryColor 
                                : Colors.grey,
                            width: 2,
                          ),
                        ),
                      ),
                      child: Center(
                        child: Text(
                          'Saved Connections',
                          style: TextStyle(
                            fontWeight: _selectedTabIndex == 1 
                                ? FontWeight.bold 
                                : FontWeight.normal,
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Content area
            _selectedTabIndex == 0
                ? _buildNewConnectionForm()
                : _buildSavedConnectionsList(terminalService),
          ],
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        if (_selectedTabIndex == 0)
          ElevatedButton(
            onPressed: _isConnecting ? null : () => _connectNew(context),
            child: _isConnecting
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Text('Connect'),
          ),
      ],
    );
  }
  
  Widget _buildNewConnectionForm() {
    return Form(
      key: _formKey,
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextFormField(
              controller: _hostController,
              decoration: const InputDecoration(
                labelText: 'Host',
                hintText: 'example.com or 192.168.1.100',
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter a host';
                }
                return null;
              },
            ),
            TextFormField(
              controller: _portController,
              decoration: const InputDecoration(
                labelText: 'Port',
              ),
              keyboardType: TextInputType.number,
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter a port';
                }
                final port = int.tryParse(value);
                if (port == null || port <= 0 || port > 65535) {
                  return 'Please enter a valid port number';
                }
                return null;
              },
            ),
            TextFormField(
              controller: _usernameController,
              decoration: const InputDecoration(
                labelText: 'Username',
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return 'Please enter a username';
                }
                return null;
              },
            ),
            TextFormField(
              controller: _passwordController,
              decoration: const InputDecoration(
                labelText: 'Password',
              ),
              obscureText: true,
            ),
            const SizedBox(height: 8),
            TextFormField(
              controller: _connectionNameController,
              decoration: const InputDecoration(
                labelText: 'Connection Name (optional)',
                hintText: 'My Server',
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Checkbox(
                  value: _saveConnection,
                  onChanged: (value) => setState(() => _saveConnection = value ?? true),
                ),
                const Text('Save connection for future use'),
              ],
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildSavedConnectionsList(TerminalService terminalService) {
    if (terminalService.savedConnections.isEmpty) {
      return const Center(
        child: Padding(
          padding: EdgeInsets.all(16.0),
          child: Text('No saved connections yet. Create a new connection and save it.'),
        ),
      );
    }
    
    return ListView.builder(
      shrinkWrap: true,
      itemCount: terminalService.savedConnections.length,
      itemBuilder: (context, index) {
        final connection = terminalService.savedConnections[index];
        return ListTile(
          title: Text(connection.name),
          subtitle: Text('${connection.username}@${connection.host}:${connection.port}'),
          trailing: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              IconButton(
                icon: const Icon(Icons.delete),
                onPressed: () {
                  terminalService.deleteSavedConnection(index);
                },
              ),
              IconButton(
                icon: const Icon(Icons.login),
                onPressed: () => _connectSaved(context, connection),
              ),
            ],
          ),
        );
      },
    );
  }

  Future<void> _connectNew(BuildContext context) async {
    if (_formKey.currentState!.validate()) {
      setState(() {
        _isConnecting = true;
      });

      final terminalService = Provider.of<TerminalService>(context, listen: false);
      
      final host = _hostController.text;
      final port = int.parse(_portController.text);
      final username = _usernameController.text;
      final password = _passwordController.text;
      final name = _connectionNameController.text.isEmpty 
          ? '$username@$host' 
          : _connectionNameController.text;
      
      final connection = SSHConnection(
        host: host,
        port: port,
        username: username,
        password: password,
        name: name,
      );
      
      try {
        // Save connection if checked
        if (_saveConnection) {
          await terminalService.saveConnection(connection);
        }
        
        final success = await terminalService.connectSSH(connection);
        
        if (success) {
          if (context.mounted) {
            Navigator.of(context).pop();
          }
        } else {
          if (mounted) {
            setState(() {
              _isConnecting = false;
            });
          
            if (context.mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('Failed to connect. Please check your credentials.'),
                  backgroundColor: Colors.red,
                ),
              );
            }
          }
        }
      } catch (e) {
        if (mounted) {
          setState(() {
            _isConnecting = false;
          });
        }
        
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Error: ${e.toString()}'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    }
  }
  
  Future<void> _connectSaved(BuildContext context, SSHConnection connection) async {
    setState(() {
      _isConnecting = true;
    });

    final terminalService = Provider.of<TerminalService>(context, listen: false);
    
    try {
      final success = await terminalService.connectSSH(connection);
      
      if (success) {
        Navigator.of(context).pop();
      } else {
        setState(() {
          _isConnecting = false;
        });
        
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to connect. Please check your credentials.'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } catch (e) {
      setState(() {
        _isConnecting = false;
      });
      
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: ${e.toString()}'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }
}