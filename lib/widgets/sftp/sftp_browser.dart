import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/sftp_service.dart';
import 'sftp_file_item.dart';
import 'sftp_transfer_dialog.dart';

/// A widget for browsing and transferring files via SFTP
class SftpBrowser extends StatefulWidget {
  const SftpBrowser({super.key});
  
  @override
  State<SftpBrowser> createState() => _SftpBrowserState();
}

class _SftpBrowserState extends State<SftpBrowser> {
  final _newDirController = TextEditingController();
  
  // Keep track of selected files
  SftpFile? _selectedRemoteFile;
  FileSystemEntity? _selectedLocalFile;
  
  @override
  void dispose() {
    _newDirController.dispose();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surface,
        borderRadius: BorderRadius.circular(4),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withAlpha(100),
            blurRadius: 8,
          ),
        ],
      ),
      child: Consumer<SftpService>(
        builder: (context, sftpService, child) {
          if (!sftpService.isConnected) {
            return const Center(
              child: Text('SFTP connection not available. Connect to SSH server first.'),
            );
          }
          
          return Column(
            children: [
              _buildBrowserHeader(context, sftpService),
              Expanded(
                child: Row(
                  children: [
                    // Remote files list (left side)
                    Expanded(
                      child: Column(
                        children: [
                          _buildPathBar(
                            context, 
                            'Remote: ${sftpService.currentRemotePath}',
                            sftpService.isBusy,
                            () => sftpService.refreshRemoteFiles(),
                            () => _showNewDirDialog(context, true),
                          ),
                          Expanded(
                            child: _buildRemoteFilesList(sftpService),
                          ),
                        ],
                      ),
                    ),
                    
                    // Divider with transfer buttons
                    _buildTransferControls(context, sftpService),
                    
                    // Local files list (right side) - only on desktop platforms
                    if (!kIsWeb)
                      Expanded(
                        child: Column(
                          children: [
                            _buildPathBar(
                              context, 
                              'Local: ${sftpService.currentLocalPath}',
                              sftpService.isBusy,
                              () => sftpService.refreshLocalFiles(),
                              () => _showNewDirDialog(context, false),
                            ),
                            Expanded(
                              child: _buildLocalFilesList(sftpService),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
  
  Widget _buildBrowserHeader(BuildContext context, SftpService sftpService) {
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.primaryContainer,
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(4),
          topRight: Radius.circular(4),
        ),
      ),
      child: Row(
        children: [
          const Text('SFTP File Browser', 
            style: TextStyle(fontWeight: FontWeight.bold),
          ),
          const Spacer(),
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              // Close the SFTP browser
              Navigator.of(context).pop();
            },
            tooltip: 'Close',
          ),
        ],
      ),
    );
  }
  
  Widget _buildPathBar(
    BuildContext context, 
    String pathText, 
    bool isBusy,
    VoidCallback onRefresh,
    VoidCallback onNewDir,
  ) {
    return Container(
      height: 40,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(color: Theme.of(context).dividerColor),
        ),
      ),
      child: Row(
        children: [
          Expanded(child: Text(pathText, overflow: TextOverflow.ellipsis)),
          if (isBusy)
            const SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          else
            IconButton(
              icon: const Icon(Icons.refresh, size: 18),
              onPressed: onRefresh,
              tooltip: 'Refresh',
            ),
          IconButton(
            icon: const Icon(Icons.create_new_folder, size: 18),
            onPressed: onNewDir,
            tooltip: 'New Folder',
          ),
        ],
      ),
    );
  }
  
  Widget _buildRemoteFilesList(SftpService sftpService) {
    final files = sftpService.remoteFiles;
    
    if (files.isEmpty) {
      return const Center(child: Text('No files found'));
    }
    
    // Add parent directory entry if not at root
    final List<Widget> items = [];
    if (sftpService.currentRemotePath != '/') {
      items.add(
        InkWell(
          onTap: () => sftpService.changeRemoteDirectory('..'),
          child: ListTile(
            leading: const Icon(Icons.folder, color: Colors.amber),
            title: const Text('..'),
          ),
        ),
      );
    }
    
    // Add file entries
    items.addAll(
      files.map((file) => SftpFileItem(
        file: file,
        isSelected: _selectedRemoteFile == file,
        onTap: () {
          if (file.isDirectory) {
            sftpService.changeRemoteDirectory(file.name);
          } else {
            setState(() => _selectedRemoteFile = file);
          }
        },
      )),
    );
    
    return ListView(children: items);
  }
  
  Widget _buildLocalFilesList(SftpService sftpService) {
    if (kIsWeb) {
      return const Center(
        child: Text('Local file access not available in web browser'),
      );
    }
    
    final entities = sftpService.localFiles;
    
    if (entities.isEmpty) {
      return const Center(child: Text('No files found'));
    }
    
    // Add parent directory entry if possible
    final List<Widget> items = [];
    if (Directory(sftpService.currentLocalPath).parent.path != sftpService.currentLocalPath) {
      items.add(
        InkWell(
          onTap: () => sftpService.changeLocalDirectory('..'),
          child: ListTile(
            leading: const Icon(Icons.folder, color: Colors.amber),
            title: const Text('..'),
          ),
        ),
      );
    }
    
    // Add file entries
    items.addAll(entities.map((entity) {
      final name = entity.path.split('/').last;
      final isDir = entity is Directory;
      
      return InkWell(
        onTap: () {
          if (isDir) {
            sftpService.changeLocalDirectory(entity.path);
          } else {
            setState(() => _selectedLocalFile = entity);
          }
        },
        child: ListTile(
          onTap: () {
            if (isDir) {
              sftpService.changeLocalDirectory(entity.path);
            } else {
              setState(() => _selectedLocalFile = entity);
            }
          },
          leading: Icon(
            isDir ? Icons.folder : Icons.insert_drive_file,
            color: isDir ? Colors.amber : Colors.blue,
          ),
          title: Text(name),
          selected: _selectedLocalFile == entity,
        ),
      );
    }));
    
    return ListView(children: items);
  }
  
  Widget _buildTransferControls(BuildContext context, SftpService sftpService) {
    return Container(
      width: 60,
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Download button (Remote -> Local)
          Tooltip(
            message: 'Download from remote',
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                shape: const CircleBorder(),
                padding: const EdgeInsets.all(8),
              ),
              onPressed: _selectedRemoteFile != null && !_selectedRemoteFile!.isDirectory && !kIsWeb
                  ? () => _downloadFile(context, sftpService)
                  : null,
              child: const Icon(Icons.arrow_forward),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Upload button (Local -> Remote)
          Tooltip(
            message: 'Upload to remote',
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                shape: const CircleBorder(),
                padding: const EdgeInsets.all(8),
              ),
              onPressed: _selectedLocalFile != null && _selectedLocalFile is File && !kIsWeb
                  ? () => _uploadFile(context, sftpService)
                  : null,
              child: const Icon(Icons.arrow_back),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Delete button
          Tooltip(
            message: 'Delete remote file',
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                shape: const CircleBorder(),
                padding: const EdgeInsets.all(8),
                backgroundColor: Colors.red,
              ),
              onPressed: _selectedRemoteFile != null
                  ? () => _deleteRemoteFile(context, sftpService)
                  : null,
              child: const Icon(Icons.delete),
            ),
          ),
        ],
      ),
    );
  }
  
  void _downloadFile(BuildContext context, SftpService sftpService) {
    if (_selectedRemoteFile == null || kIsWeb) return;
    
    final fileName = _selectedRemoteFile!.name;
    final remotePath = _selectedRemoteFile!.path;
    final localPath = '${sftpService.currentLocalPath}/$fileName';
    
    showDialog(
      context: context,
      builder: (context) => SftpTransferDialog(
        title: 'Downloading $fileName',
        operation: () => sftpService.downloadFile(_selectedRemoteFile!, localPath),
      ),
    );
  }
  
  void _uploadFile(BuildContext context, SftpService sftpService) {
    if (_selectedLocalFile == null || !(_selectedLocalFile is File) || kIsWeb) return;
    
    final fileName = _selectedLocalFile!.path.split('/').last;
    final localPath = _selectedLocalFile!.path;
    final remotePath = '${sftpService.currentRemotePath}/$fileName';
    
    showDialog(
      context: context,
      builder: (context) => SftpTransferDialog(
        title: 'Uploading $fileName',
        operation: () => sftpService.uploadFile(localPath, remotePath),
      ),
    );
  }
  
  void _deleteRemoteFile(BuildContext context, SftpService sftpService) {
    if (_selectedRemoteFile == null) return;
    
    final fileName = _selectedRemoteFile!.name;
    final isDir = _selectedRemoteFile!.isDirectory;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Delete ${isDir ? 'Directory' : 'File'}'),
        content: Text('Are you sure you want to delete "$fileName"?${isDir ? ' Directory must be empty.' : ''}'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(context);
              final success = await sftpService.deleteRemoteFile(_selectedRemoteFile!);
              if (!success) {
                _showErrorSnackBar(context, 'Failed to delete ${isDir ? 'directory' : 'file'}.');
              }
              setState(() => _selectedRemoteFile = null);
            },
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
  
  void _showNewDirDialog(BuildContext context, bool isRemote) {
    _newDirController.clear();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('Create ${isRemote ? 'Remote' : 'Local'} Directory'),
        content: TextField(
          controller: _newDirController,
          decoration: const InputDecoration(
            labelText: 'Directory Name',
            hintText: 'my_folder',
          ),
          autofocus: true,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () async {
              final dirName = _newDirController.text.trim();
              Navigator.pop(context);
              
              if (dirName.isEmpty) return;
              
              final sftpService = Provider.of<SftpService>(context, listen: false);
              bool success;
              
              if (isRemote) {
                success = await sftpService.createRemoteDirectory(dirName);
              } else {
                success = await sftpService.createLocalDirectory(dirName);
              }
              
              if (!success) {
                _showErrorSnackBar(context, 'Failed to create directory');
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }
  
  void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        behavior: SnackBarBehavior.floating,
      ),
    );
  }
}