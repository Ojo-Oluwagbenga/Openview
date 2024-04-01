import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:one_klass/Screens/inappwebviewstack.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import 'package:one_klass/Screens/inappwebviewstack.dart' as x;

class LocalNotification {
  static Future initialize(
      FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin) async {
    tz.initializeTimeZones();
    var androidinitialize =
        const AndroidInitializationSettings("mipmap/ic_launcher");
    DarwinInitializationSettings initializationSettings =
        const DarwinInitializationSettings();

    var initilizationSettings = InitializationSettings(
        android: androidinitialize, iOS: initializationSettings);

    await flutterLocalNotificationsPlugin.initialize(initilizationSettings);
  }

  static Future showBigTextNotification({
    var id = 0,
    required String title,
    required String body,
    var payload,
    required FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin,
  }) async {
    AndroidNotificationDetails androidNotificationDetails =
        const AndroidNotificationDetails("001", "alam",
            playSound: true,
            importance: Importance.max,
            priority: Priority.max);

    const DarwinNotificationDetails darwinNotificationDetails =
        DarwinNotificationDetails(presentSound: false);

    var not = NotificationDetails(
      android: androidNotificationDetails,
      iOS: darwinNotificationDetails,
    );
    if (Alarmtime > 0) {
      var scheduledTime =
          tz.TZDateTime.now(tz.local).add(Duration(minutes: Alarmtime));
      Alarmtime = 0;

      await flutterLocalNotificationsPlugin.zonedSchedule(
          id, title, body, scheduledTime, not,
          androidAllowWhileIdle: true,
          uiLocalNotificationDateInterpretation:
              UILocalNotificationDateInterpretation.absoluteTime);
    }
    if (CancelAlarm = true) {
      await flutterLocalNotificationsPlugin.cancel(0);
      CancelAlarm = false;
    }
  }
}
