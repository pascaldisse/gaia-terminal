import 'package:flutter_test/flutter_test.dart';
import 'package:gaia_terminal/services/sftp_service.dart';
import 'package:dartssh2/dartssh2.dart';

// Mock implementation for SftpName and SftpStat 
class MockSftpName implements SftpName {
  @override
  final String filename;
  @override
  final String longname;
  
  MockSftpName(this.filename, this.longname);
}

class MockSftpStat implements SftpStat {
  @override
  final int permissions;
  @override
  final int size;
  @override
  final BigInt atime;
  @override
  final BigInt accessTime;
  @override
  final BigInt createTime;
  @override
  final BigInt ctime;
  @override
  final int flags;
  @override
  final int gid;
  @override
  final BigInt modificationTime;
  @override
  final BigInt mtime;
  @override
  final int type;
  @override
  final int uid;
  
  MockSftpStat({
    required this.permissions,
    required this.size,
    required this.uid,
    required this.gid,
    required this.mtime,
  }) : 
    atime = BigInt.from(0),
    accessTime = BigInt.from(0),
    createTime = BigInt.from(0),
    ctime = BigInt.from(0),
    flags = 0,
    modificationTime = mtime,
    type = 0;
}

void main() {
  group('SftpFile tests', () {
    test('should format file size correctly', () {
      // Create a file entry
      final fileStat = MockSftpStat(
        permissions: 0,
        size: 512,
        uid: 1000,
        gid: 1000,
        mtime: BigInt.from(1609459200), // 2021-01-01
      );
      
      final file = SftpFile.fromStat(
        MockSftpName('test.txt', '-rw-r--r-- 1 user group 512 Jan 1 2021 test.txt'),
        fileStat,
        '/home/user',
      );
      
      expect(file.name, 'test.txt');
      expect(file.size, 512);
      expect(file.path, '/home/user/test.txt');
    });
    
    test('should detect directories from permissions', () {
      // Create a directory entry with directory permission bit
      final dirStat = MockSftpStat(
        permissions: SftpFileType.ifDir, // Directory flag
        size: 4096,
        uid: 1000,
        gid: 1000,
        mtime: BigInt.from(1609459200),
      );
      
      final dir = SftpFile.fromStat(
        MockSftpName('test_dir', 'drwxr-xr-x 2 user group 4096 Jan 1 2021 test_dir'),
        dirStat,
        '/home/user',
      );
      
      expect(dir.name, 'test_dir');
      expect(dir.isDirectory, true);
    });
    
    test('should convert permissions to string representation correctly', () {
      // File with -rw-r--r-- permissions (644)
      final fileStat = MockSftpStat(
        permissions: SftpFileMode.ownerRead | SftpFileMode.ownerWrite | 
                    SftpFileMode.groupRead | SftpFileMode.otherRead,
        size: 512,
        uid: 1000,
        gid: 1000,
        mtime: BigInt.from(1609459200),
      );
      
      final file = SftpFile.fromStat(
        MockSftpName('test.txt', '-rw-r--r-- 1 user group 512 Jan 1 2021 test.txt'),
        fileStat,
        '/home/user',
      );
      
      expect(file.permissions, '-rw-r--r--');
      
      // Directory with drwxr-xr-x permissions (755)
      final dirStat = MockSftpStat(
        permissions: SftpFileType.ifDir | 
                    SftpFileMode.ownerRead | SftpFileMode.ownerWrite | SftpFileMode.ownerExec |
                    SftpFileMode.groupRead | SftpFileMode.groupExec |
                    SftpFileMode.otherRead | SftpFileMode.otherExec,
        size: 4096,
        uid: 1000,
        gid: 1000,
        mtime: BigInt.from(1609459200),
      );
      
      final dir = SftpFile.fromStat(
        MockSftpName('test_dir', 'drwxr-xr-x 2 user group 4096 Jan 1 2021 test_dir'),
        dirStat,
        '/home/user',
      );
      
      expect(dir.permissions, 'drwxr-xr-x');
    });
  });
}