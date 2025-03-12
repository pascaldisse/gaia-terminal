import 'package:flutter/material.dart';
import '../../services/sftp_service.dart';

/// A widget representing a single file or directory in the SFTP browser
class SftpFileItem extends StatelessWidget {
  final SftpFile file;
  final bool isSelected;
  final VoidCallback onTap;
  final VoidCallback? onDoubleTap;
  
  const SftpFileItem({
    super.key,
    required this.file,
    required this.isSelected,
    required this.onTap,
    this.onDoubleTap,
  });

  @override
  Widget build(BuildContext context) {
    final fileName = file.name;
    final fileSize = _formatFileSize(file.size);
    final modTime = file.lastModified != null 
        ? _formatDateTime(file.lastModified!)
        : '';
    
    return ListTile(
      leading: Icon(
        file.isDirectory ? Icons.folder : _getFileIcon(fileName),
        color: file.isDirectory ? Colors.amber : Colors.blue,
      ),
      title: Text(fileName),
      subtitle: Text(
        '${file.permissions}  $fileSize  $modTime',
        style: const TextStyle(fontSize: 12),
      ),
      selected: isSelected,
      selectedTileColor: Theme.of(context).colorScheme.primaryContainer.withOpacity(0.3),
      onTap: onTap,
      onDoubleTap: onDoubleTap,
    );
  }
  
  /// Get appropriate icon based on file extension
  IconData _getFileIcon(String fileName) {
    final extension = fileName.contains('.')
        ? fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase()
        : '';
    
    switch (extension) {
      case 'pdf':
        return Icons.picture_as_pdf;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return Icons.image;
      case 'mp3':
      case 'wav':
      case 'ogg':
      case 'flac':
        return Icons.music_note;
      case 'mp4':
      case 'mkv':
      case 'avi':
      case 'mov':
        return Icons.movie;
      case 'doc':
      case 'docx':
      case 'txt':
      case 'rtf':
        return Icons.description;
      case 'xls':
      case 'xlsx':
      case 'csv':
        return Icons.table_chart;
      case 'ppt':
      case 'pptx':
        return Icons.slideshow;
      case 'zip':
      case 'rar':
      case 'tar':
      case 'gz':
      case '7z':
        return Icons.archive;
      case 'exe':
      case 'app':
      case 'sh':
      case 'bat':
        return Icons.settings_applications;
      default:
        return Icons.insert_drive_file;
    }
  }
  
  /// Format file size to human-readable format
  String _formatFileSize(int bytes) {
    if (bytes < 1024) {
      return '$bytes B';
    } else if (bytes < 1024 * 1024) {
      final kb = (bytes / 1024).toStringAsFixed(1);
      return '$kb KB';
    } else if (bytes < 1024 * 1024 * 1024) {
      final mb = (bytes / (1024 * 1024)).toStringAsFixed(1);
      return '$mb MB';
    } else {
      final gb = (bytes / (1024 * 1024 * 1024)).toStringAsFixed(2);
      return '$gb GB';
    }
  }
  
  /// Format date time to readable string
  String _formatDateTime(DateTime dateTime) {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final date = DateTime(dateTime.year, dateTime.month, dateTime.day);
    
    if (date == today) {
      // Today, show only time
      return '${_padZero(dateTime.hour)}:${_padZero(dateTime.minute)}';
    } else if (date.year == today.year) {
      // This year, show month and day
      return '${_padZero(dateTime.month)}/${_padZero(dateTime.day)} ${_padZero(dateTime.hour)}:${_padZero(dateTime.minute)}';
    } else {
      // Different year, show year, month, day
      return '${dateTime.year}/${_padZero(dateTime.month)}/${_padZero(dateTime.day)}';
    }
  }
  
  /// Pad single digits with leading zero
  String _padZero(int number) {
    return number.toString().padLeft(2, '0');
  }
}