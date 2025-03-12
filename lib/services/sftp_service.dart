import 'dart:io';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:dartssh2/dartssh2.dart';

/// Data model for a file in the SFTP browser
class SftpFile {
  final String name;
  final String path;
  final bool isDirectory;
  final int size;
  final DateTime? lastModified;
  final String owner;
  final String permissions;
  
  SftpFile({
    required this.name,
    required this.path,
    required this.isDirectory,
    required this.size,
    this.lastModified,
    required this.owner,
    required this.permissions,
  });
  
  /// Create from SSH stat object
  factory SftpFile.fromStat(SftpName name, SftpFileAttrs stat, String currentPath) {
    final fullPath = '$currentPath/${name.filename}';
    
    // Determine if it's a directory (using longname which often starts with 'd' for directories)
    final isDir = name.longname?.startsWith('d') ?? false;
    
    // Default permissions string
    final permStr = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
    
    // Get size (defaults to 0 if null)
    final size = stat.size ?? 0;
    
    // Default modification time to now
    DateTime modTime = DateTime.now();
    
    return SftpFile(
      name: name.filename,
      path: fullPath, 
      isDirectory: isDir,
      size: size,
      lastModified: modTime,
      owner: "owner", // Not available in this version
      permissions: permStr,
    );
  }
  
  /// Convert a file stat permission value to a string representation (e.g., "drwxr-xr-x")
  static String _permissionsToString(int permissions) {
    String result = '';
    
    // File type - using FileType enum in FileStat
    if ((permissions & 0x4000) != 0) { // Directory mask
      result += 'd';
    } else if ((permissions & 0xA000) != 0) { // Symlink mask
      result += 'l';
    } else {
      result += '-';
    }
    
    // User permissions
    result += ((permissions & 0x0100) != 0) ? 'r' : '-'; // Owner read: 0400
    result += ((permissions & 0x0080) != 0) ? 'w' : '-'; // Owner write: 0200
    result += ((permissions & 0x0040) != 0) ? 'x' : '-'; // Owner execute: 0100
    
    // Group permissions
    result += ((permissions & 0x0020) != 0) ? 'r' : '-'; // Group read: 040
    result += ((permissions & 0x0010) != 0) ? 'w' : '-'; // Group write: 020
    result += ((permissions & 0x0008) != 0) ? 'x' : '-'; // Group execute: 010
    
    // Other permissions
    result += ((permissions & 0x0004) != 0) ? 'r' : '-'; // Others read: 04
    result += ((permissions & 0x0002) != 0) ? 'w' : '-'; // Others write: 02
    result += ((permissions & 0x0001) != 0) ? 'x' : '-'; // Others execute: 01
    
    return result;
  }
}

/// Service for handling SFTP file transfers and browsing
class SftpService extends ChangeNotifier {
  SSHClient? _sshClient;
  SftpClient? _sftpClient;
  
  bool _isBusy = false;
  String _currentRemotePath = '/';
  String _currentLocalPath = '';
  
  List<SftpFile> _remoteFiles = [];
  List<FileSystemEntity> _localFiles = [];
  
  bool get isConnected => _sftpClient != null;
  bool get isBusy => _isBusy;
  String get currentRemotePath => _currentRemotePath;
  String get currentLocalPath => _currentLocalPath;
  List<SftpFile> get remoteFiles => _remoteFiles;
  List<FileSystemEntity> get localFiles => _localFiles;
  
  /// Initialize the service with an existing SSH client
  Future<bool> initialize(SSHClient client) async {
    if (_sftpClient != null) {
      // Already initialized, close existing connection
      _sftpClient!.close();
      _sftpClient = null;
    }
    
    _sshClient = client;
    _isBusy = true;
    
    try {
      _sftpClient = await client.sftp();
      
      // Set initial paths
      _currentRemotePath = await _getRemoteHomePath() ?? '/';
      _currentLocalPath = _getPlatformHomeDirectory();
      
      // Load initial files
      await refreshRemoteFiles();
      await refreshLocalFiles();
      
      return true;
    } catch (e) {
      debugPrint('SFTP init error: $e');
      _sftpClient = null;
      return false;
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Close the SFTP session
  Future<void> close() async {
    if (_sftpClient != null) {
      _sftpClient!.close();
      _sftpClient = null;
      _remoteFiles = [];
      notifyListeners();
    }
  }
  
  /// Refresh the list of remote files
  Future<void> refreshRemoteFiles() async {
    if (_sftpClient == null) return;
    
    _isBusy = true;
    notifyListeners();
    
    try {
      _remoteFiles = [];
      // Read directory contents as a stream and collect names
      final names = <SftpName>[];
      await for (final nameList in _sftpClient!.readdir(_currentRemotePath)) {
        names.addAll(nameList);
      }
      
      // Get stats for each file
      for (final name in names) {
        try {
          final stat = await _sftpClient!.stat('$_currentRemotePath/${name.filename}');
          final sftpFile = SftpFile.fromStat(name, stat, _currentRemotePath);
          
          // Skip . and .. directories
          if (sftpFile.name != '.' && sftpFile.name != '..') {
            _remoteFiles.add(sftpFile);
          }
        } catch (e) {
          debugPrint('Error getting stats for ${name.filename}: $e');
        }
      }
      
      // Sort directories first, then by name
      _remoteFiles.sort((a, b) {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.toLowerCase().compareTo(b.name.toLowerCase());
      });
    } catch (e) {
      debugPrint('Error refreshing remote files: $e');
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Refresh the list of local files
  Future<void> refreshLocalFiles() async {
    if (kIsWeb) {
      // Web platform doesn't support local file access
      _localFiles = [];
      notifyListeners();
      return;
    }
    
    _isBusy = true;
    notifyListeners();
    
    try {
      final dir = Directory(_currentLocalPath);
      final entities = await dir.list().toList();
      
      // Filter out hidden files and sort directories first
      _localFiles = entities.where((entity) => 
        !entity.path.split('/').last.startsWith('.')
      ).toList();
      
      _localFiles.sort((a, b) {
        final aIsDir = a is Directory;
        final bIsDir = b is Directory;
        
        if (aIsDir && !bIsDir) return -1;
        if (!aIsDir && bIsDir) return 1;
        
        return a.path.toLowerCase().compareTo(b.path.toLowerCase());
      });
    } catch (e) {
      debugPrint('Error refreshing local files: $e');
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Change the remote directory
  Future<void> changeRemoteDirectory(String path) async {
    if (_sftpClient == null) return;
    
    _isBusy = true;
    notifyListeners();
    
    try {
      // Normalize path
      if (path == '..') {
        // Go to parent directory
        final parts = _currentRemotePath.split('/')
          ..removeWhere((part) => part.isEmpty);
        
        if (parts.isNotEmpty) {
          parts.removeLast();
          _currentRemotePath = '/${parts.join('/')}';
          if (_currentRemotePath == '') _currentRemotePath = '/';
        }
      } else if (path.startsWith('/')) {
        // Absolute path
        _currentRemotePath = path;
      } else {
        // Relative path
        _currentRemotePath = '$_currentRemotePath/$path'.replaceAll('//', '/');
      }
      
      await refreshRemoteFiles();
    } catch (e) {
      debugPrint('Error changing remote directory: $e');
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Change the local directory
  Future<void> changeLocalDirectory(String path) async {
    if (kIsWeb) return; // Not supported on web
    
    _isBusy = true;
    notifyListeners();
    
    try {
      if (path == '..') {
        // Go to parent directory
        final dir = Directory(_currentLocalPath);
        final parent = dir.parent;
        _currentLocalPath = parent.path;
      } else if (path.startsWith('/')) {
        // Absolute path
        _currentLocalPath = path;
      } else {
        // Relative path
        _currentLocalPath = '$_currentLocalPath/$path';
      }
      
      await refreshLocalFiles();
    } catch (e) {
      debugPrint('Error changing local directory: $e');
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Download a file from remote to local
  Future<bool> downloadFile(SftpFile remoteFile, String localPath) async {
    if (_sftpClient == null || kIsWeb) return false;
    
    _isBusy = true;
    notifyListeners();
    
    try {
      // Create local file
      final file = File(localPath);
      final sink = file.openWrite();
      
      try {
        // Open remote file and stream to local
        final remoteHandle = await _sftpClient!.open(remoteFile.path, mode: SftpFileOpenMode.read);
        
        // Read the file data
        try {
          // In the newer API, we need to get a stream and pipe it to the file
          final dataStream = remoteHandle.read();
          await for (final chunk in dataStream) {
            sink.add(chunk);
          }
        } catch (e) {
          debugPrint('Error reading file data: $e');
          throw e;
        }
        
        await remoteHandle.close();
        await sink.flush();
        await sink.close();
        
        await refreshLocalFiles();
        return true;
      } catch (e) {
        debugPrint('Error downloading file: $e');
        await sink.close();
        // Clean up partial file
        if (await file.exists()) {
          await file.delete();
        }
        return false;
      }
    } catch (e) {
      debugPrint('Error preparing download: $e');
      return false;
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Upload a file from local to remote
  Future<bool> uploadFile(String localPath, String remotePath) async {
    if (_sftpClient == null || kIsWeb) return false;
    
    _isBusy = true;
    notifyListeners();
    
    try {
      // Read local file
      final file = File(localPath);
      final bytes = await file.readAsBytes();
      
      // Create remote file
      final remoteHandle = await _sftpClient!.open(
        remotePath, 
        mode: SftpFileOpenMode.create | SftpFileOpenMode.write | SftpFileOpenMode.truncate
      );
      
      // Write file bytes
      try {
        // Use the writeBytes method to write the entire file
        await remoteHandle.writeBytes(bytes);
      } catch (e) {
        debugPrint('Error writing file data: $e');
        throw e;
      }
      
      await remoteHandle.close();
      await refreshRemoteFiles();
      return true;
    } catch (e) {
      debugPrint('Error uploading file: $e');
      return false;
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Create a new directory on the remote system
  Future<bool> createRemoteDirectory(String dirName) async {
    if (_sftpClient == null) return false;
    
    _isBusy = true;
    notifyListeners();
    
    try {
      final path = '$_currentRemotePath/$dirName'.replaceAll('//', '/');
      // Use standard permission bits (0755 - rwxr-xr-x)
      await _sftpClient!.mkdir(path);
      await refreshRemoteFiles();
      return true;
    } catch (e) {
      debugPrint('Error creating remote directory: $e');
      return false;
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Delete a file or directory on the remote system
  Future<bool> deleteRemoteFile(SftpFile file) async {
    if (_sftpClient == null) return false;
    
    _isBusy = true;
    notifyListeners();
    
    try {
      if (file.isDirectory) {
        // Try to remove directory (will fail if not empty)
        await _sftpClient!.rmdir(file.path);
      } else {
        // Remove file
        await _sftpClient!.remove(file.path);
      }
      await refreshRemoteFiles();
      return true;
    } catch (e) {
      debugPrint('Error deleting remote file: $e');
      return false;
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Create a new directory on the local system
  Future<bool> createLocalDirectory(String dirName) async {
    if (kIsWeb) return false;
    
    _isBusy = true;
    notifyListeners();
    
    try {
      final path = '$_currentLocalPath/$dirName';
      final dir = Directory(path);
      await dir.create();
      await refreshLocalFiles();
      return true;
    } catch (e) {
      debugPrint('Error creating local directory: $e');
      return false;
    } finally {
      _isBusy = false;
      notifyListeners();
    }
  }
  
  /// Get the remote home directory path
  Future<String?> _getRemoteHomePath() async {
    if (_sshClient == null) return null;
    
    try {
      // Try to run 'pwd' to get the current directory
      final result = await _sshClient!.run('pwd');
      // In the updated API, result is a Uint8List
      return utf8.decode(result).trim();
    } catch (e) {
      debugPrint('Error getting remote home path: $e');
    }
    
    return '/'; // Default to root if unable to determine
  }
  
  /// Get the platform-specific home directory
  String _getPlatformHomeDirectory() {
    if (kIsWeb) return ''; // Not applicable
    
    try {
      if (Platform.isWindows) {
        return '${Platform.environment['USERPROFILE']}';
      } else {
        return '${Platform.environment['HOME']}';
      }
    } catch (e) {
      debugPrint('Error getting home directory: $e');
      return '/';
    }
  }
}