import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

late final fCMToken;

Future<void> handelbgmessage(RemoteMessage message) async {
  print("The freaking data");
  print('body : ${message.notification?.body}');
  print('Title : ${message.notification?.title}');
  print('payload : ${message.data}');
}

class FirebaseApi {
  final _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initNotifications() async {
    late InAppWebViewController webViewController;

    await _firebaseMessaging.requestPermission();
    fCMToken = await _firebaseMessaging.getToken();
    print('Token:$fCMToken===');
    FirebaseMessaging.onBackgroundMessage(
        (message) => handelbgmessage(message));

    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      print('Got a message whilst in the foregrounder!');
      print('Message data: ${message.data}');
      print(message);

      if (message.notification != null) {
        print('Message also contained a notification: ${message.notification}');
      }
    });
  }
}
