import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class Cache {
  final int? id;
  final String type;
  final String packet;

  const Cache({required this.type, required this.packet, this.id});

  factory Cache.fromJson(Map<String, dynamic> json) =>
      Cache(id: json['id'], type: json['type'], packet: json['packet']);

  Map<String, dynamic> toJson() => {
        'id': id,
        'type': type,
        'packet': packet,
      };
}

class DatabaseCache {
  static const int _version = 1;
  static const String _dbname = 'Cache.db';

  static Future<Database> _getDB() async {
    return openDatabase(join(await getDatabasesPath(), _dbname),
        onCreate: (db, version) async => await db.execute(
              "CREATE TABLE A_table (id INTEGER PRIMARY KEY AUTOINCREMENT, type TEXT NOT NULL, packet TEXT NOT NULL)",
            ),
        version: _version);
  }

  static Future<int> addCache(Cache cache) async {
    final db = await _getDB();
    return await db.insert('A_table', cache.toJson(),
        conflictAlgorithm: ConflictAlgorithm.replace);
  }

  static Future<bool> updateCache(
    Cache cache,
  ) async {
    final db = await _getDB();
    bool hub;
    int git = await db.update('A_table', cache.toJson(),
        where: 'type=?',
        whereArgs: [cache.type],
        conflictAlgorithm: ConflictAlgorithm.replace);
    if (git != 0) {
      hub = true;
    } else {
      hub = false;
    }
    return hub;
  }

  static Future<int> deleteCache(Cache cache) async {
    final db = await _getDB();
    return await db.delete(
      'A_table',
      where: 'type=?',
      whereArgs: [cache.type],
    );
  }

  static Future<List<Cache>?> getAllCache() async {
    final db = await _getDB();
    final List<Map<String, dynamic>> maps = await db.query('A_table');

    if (maps.isEmpty) {
      return null;
    }

    return List.generate(maps.length, (index) => Cache.fromJson(maps[index]));
  }

  static Future<List<Map<String, dynamic>>?> getCache(String request) async {
    final db = await _getDB();
    final List<Map<String, dynamic>> maps = await db.query("A_table",
        columns: [
          'type',
          'packet',
        ],
        where: 'type =?',
        whereArgs: [request]);

    if (maps.isEmpty) {
      return null;
    }

    return maps;
    // return List.generate(maps.length, (index) => Cache.fromJson(maps[index]));
  }

  static Future<List<Cache>> getTimeCache() async {
    final db = await _getDB();
    final List<Map<String, dynamic>> maps = await db.query("A_table",
        columns: ['type', 'packet'], where: 'type =?', whereArgs: ['time']);

    // if (maps.isEmpty) {
    //   // print(maps);
    //   return null;
    // }
    // print(maps);
    return List.generate(maps.length, (index) => Cache.fromJson(maps[index]));
  }
}
